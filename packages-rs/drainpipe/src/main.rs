use futures_util::stream::StreamExt;
use std::env;
use std::error::Error;
use std::time::Duration;
use tokio::time::timeout;
use tokio_tungstenite::{connect_async, tungstenite::protocol::Message};

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    let url = env::var("JETSTREAM_URL")
        .unwrap_or("wss://jetstream1.us-west.bsky.network/subscribe".to_string());

    let mut reconnect_attempts = 0;
    let max_reconnect_attempts = 5;

    loop {
        let (mut stream, _) = match timeout(Duration::from_secs(10), connect_async(&url)).await {
            Ok(Ok(result)) => result,
            Ok(Err(e)) => {
                eprintln!("WebSocket error: {}", e);
                reconnect_attempts += 1;
                if reconnect_attempts > max_reconnect_attempts {
                    println!("Maximum reconnect attempts reached, exiting.");
                    return Ok(());
                }
                continue;
            }
            Err(_) => {
                println!("Failed to connect to WebSocket, retrying...");
                reconnect_attempts += 1;
                if reconnect_attempts > max_reconnect_attempts {
                    println!("Maximum reconnect attempts reached, exiting.");
                    return Ok(());
                }
                continue;
            }
        };

        reconnect_attempts = 0;

        while let Some(msg) = stream.next().await {
            match msg {
                Ok(Message::Text(json_string)) => {
                    let json: serde_json::Value = serde_json::from_str(&json_string).unwrap();
                    println!("{}", serde_json::to_string_pretty(&json).unwrap());
                }
                Err(e) => {
                    eprintln!("Error: {}", e);
                    break;
                }
                _ => {}
            }
        }

        println!("WebSocket connection closed, attempting to reconnect...");
    }
}

// jetstream1.us-east.bsky.network US-East
// jetstream2.us-east.bsky.network US-East
// jetstream1.us-west.bsky.network US-West
// jetstream2.us-west.bsky.network US-West
