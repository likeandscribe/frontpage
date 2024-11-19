mod config;
mod jetstream;

use chrono::{TimeZone, Utc};
use config::Config;
use jetstream::event::JetstreamEvent;
use jetstream::{
    DefaultJetstreamEndpoints, JetstreamCompression, JetstreamConfig, JetstreamConnector,
};
use serde::Serialize;
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
    let config = Config::from_env()?;
    let store = drainpipe_store::Store::open(&config.store_location)?;

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

    let existing_cursor = store
        .get_cursor()?
        .map(|ts| {
            Utc.timestamp_micros(ts as i64)
                .earliest()
                .ok_or(anyhow::anyhow!("Could not convert timestamp to Utc"))
        })
        .transpose()?;

    let jetstream = JetstreamConnector::new(JetstreamConfig {
        endpoint: DefaultJetstreamEndpoints::USEastOne.into(),
        wanted_collections: vec!["fyi.unravel.frontpage.*".to_string()],
        wanted_dids: vec![],
        compression: JetstreamCompression::Zstd,
        cursor: existing_cursor.map(|c| c - Duration::from_secs(10)),
    })?;

    let mut reconnect_attempts = 0;
    let max_reconnect_attempts = 5;

    loop {
        let (receiver, _) = match timeout(Duration::from_secs(10), jetstream.connect()).await {
            Ok(Ok(result)) => result,
            Ok(Err(e)) => {
                log::error!("WebSocket error: {}", e);
                reconnect_attempts += 1;
                if reconnect_attempts > max_reconnect_attempts {
                    log::error!("Maximum reconnect attempts reached, exiting.");
                    return Ok(());
                }
                continue;
            }
            Err(_) => {
                log::error!("Failed to connect to WebSocket, retrying...");
                reconnect_attempts += 1;
                if reconnect_attempts > max_reconnect_attempts {
                    log::error!("Maximum reconnect attempts reached, exiting.");
                    return Ok(());
                }
                continue;
            }
        };

        reconnect_attempts = 0;

        while let Ok(event) = receiver.recv_async().await {
            monitor
                .instrument(async {
                    if let JetstreamEvent::Commit(ref commit) = event {
                        println!("Received commit: {:?}", commit);
                        send_frontpage_commit(&config, commit)
                            .await
                            .and_then(|_| {
                                log::info!("Successfully sent frontpage commit");
                                Ok(())
                            })
                            .or_else(|e| {
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

fn u64_serialize<S>(x: &u64, s: S) -> Result<S::Ok, S::Error>
where
    S: serde::Serializer,
{
    s.serialize_str(&x.to_string())
}

#[derive(Serialize, Debug)]
struct ConsumerBody<'a> {
    ops: &'a Vec<&'a jetstream::event::CommitEvent>,
    repo: &'a str,
    #[serde(serialize_with = "u64_serialize")]
    seq: u64,
}

async fn send_frontpage_commit(
    cfg: &Config,
    commit: &jetstream::event::CommitEvent,
) -> anyhow::Result<()> {
    let client = reqwest::Client::new();

    let commit_info = commit.info();

    let response = client
        .post(&cfg.frontpage_consumer_url)
        .header(
            "Authorization",
            format!("Bearer {}", cfg.frontpage_consumer_secret),
        )
        .json(&ConsumerBody {
            ops: &vec![commit],
            repo: &commit_info.did,
            seq: commit_info.time_us,
        })
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
