mod config;
mod jetstream;

use chrono::{TimeZone, Utc};
use config::Config;
use jetstream::event::{CommitEvent, JetstreamEvent};
use jetstream::{
    DefaultJetstreamEndpoints, JetstreamCompression, JetstreamConfig, JetstreamConnector,
};
use serde_json::json;
use std::path::PathBuf;
use std::time::Duration;
use std::vec;
use tokio::time::timeout;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Load environment variables from .env.local and .env when ran with cargo run
    if let Some(manifest_dir) = std::env::var("CARGO_MANIFEST_DIR").ok() {
        let env_path: PathBuf = [&manifest_dir, ".env.local"].iter().collect();
        dotenv_flow::from_filename(env_path)?;
        let env_path: PathBuf = [&manifest_dir, ".env"].iter().collect();
        dotenv_flow::from_filename(env_path)?;
    }

    env_logger::init();

    let monitor = tokio_metrics::TaskMonitor::new();

    {
        let metrics_monitor = monitor.clone();
        tokio::spawn(async move {
            for interval in metrics_monitor.intervals() {
                log::info!("{:?} per second", interval.instrumented_count as f64 / 5.0,);
                tokio::time::sleep(Duration::from_millis(5000)).await;
            }
        });
    }

    let config = Config::from_env()?;
    let store = drainpipe_store::Store::open(&config.store_location)?;
    let endpoint = config
        .jetstream_url
        .clone()
        .unwrap_or(DefaultJetstreamEndpoints::USEastOne.into());

    loop {
        let existing_cursor = store
            .get_cursor()?
            .map(|ts| {
                Utc.timestamp_micros(ts as i64)
                    .earliest()
                    .ok_or(anyhow::anyhow!("Could not convert timestamp to Utc"))
            })
            .transpose()?;

        let receiver = connect(JetstreamConfig {
            endpoint: endpoint.clone(),
            wanted_collections: vec!["fyi.unravel.frontpage.*".to_string()],
            wanted_dids: vec![],
            compression: JetstreamCompression::Zstd,
            cursor: existing_cursor.map(|c| c - Duration::from_secs(10)),
        })
        .await?;

        while let Ok(event) = receiver.recv_async().await {
            monitor
                .instrument(async {
                    if let JetstreamEvent::Commit(ref commit) = event {
                        println!("Received commit: {:?}", commit);

                        send_frontpage_commit(&config, commit).await.or_else(|e| {
                            log::error!("Error processing commit: {:?}", e);
                            store.record_dead_letter(&drainpipe_store::DeadLetter::new(
                                commit.info().time_us.to_string(),
                                serde_json::to_string(commit)?,
                                e.to_string(),
                            ))
                        })?
                    }

                    store.set_cursor(event.info().time_us)?;

                    Ok(()) as anyhow::Result<()>
                })
                .await?
        }

        log::info!("WebSocket connection closed, attempting to reconnect...");
    }
}

async fn connect(config: JetstreamConfig) -> anyhow::Result<flume::Receiver<JetstreamEvent>> {
    let jetstream = JetstreamConnector::new(config)?;
    let mut retry_delay_seconds = 1;

    loop {
        match timeout(Duration::from_secs(10), jetstream.connect()).await {
            Ok(Ok((receiver, _))) => return Ok(receiver),
            Ok(Err(e)) => {
                log::error!("WebSocket error. Retrying... {}", e);
            }
            Err(e) => {
                log::error!("Timed out after {e} connecting to WebSocket, retrying...");
            }
        }

        // Exponential backoff
        tokio::time::sleep(Duration::from_secs(retry_delay_seconds)).await;

        // Cap the delay at 16s
        retry_delay_seconds = std::cmp::min(retry_delay_seconds * 2, 16);
    }
}

async fn send_frontpage_commit(
    cfg: &Config,
    commit: &jetstream::event::CommitEvent,
) -> anyhow::Result<()> {
    let client = reqwest::Client::new();

    // Structure of the "ops" json array and the body of the request in general is a little whacky because it's
    // matching the old drainpipe code where we would send the relay event to the consumer verbatim.
    // There is potential for improvement here.
    let ops = match commit {
        CommitEvent::Update { .. } => anyhow::bail!("Update commits are not supported"),
        CommitEvent::Create { commit, .. } => json!([{
            "action": "create",
            "path": format!("{}/{}", commit.info.collection.to_string(), commit.info.rkey),
            "cid": commit.cid,
        }]),
        CommitEvent::Delete { commit, .. } => json!([{
            "action": "create",
            "path": format!("{}/{}", commit.collection.to_string(), commit.rkey)
        }]),
    };

    let commit_info = commit.info();

    let response = client
        .post(&cfg.frontpage_consumer_url)
        .header(
            "Authorization",
            format!("Bearer {}", cfg.frontpage_consumer_secret),
        )
        .json(&json!({
            "repo": commit_info.did,
            "seq": commit_info.time_us.to_string(),
            "ops": ops
        }))
        .send()
        .await?;

    let status = response.status();
    if status.is_success() {
        log::info!("Successfully sent frontpage ops");
    } else {
        anyhow::bail!("Failed to send frontpage ops: {:?}", status)
    }
    Ok(())
}
