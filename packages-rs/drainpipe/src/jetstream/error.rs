use std::io;
use thiserror::Error;

/// Possible errors that can occur when a [JetstreamConfig](crate::JetstreamConfig) that is passed
/// to a [JetstreamConnector](crate::JetstreamConnector) is invalid.
#[derive(Error, Debug)]
pub enum ConfigValidationError {
    #[error("too many wanted collections: {0} > 100")]
    TooManyWantedCollections(usize),
    #[error("too many wanted DIDs: {0} > 10,000")]
    TooManyDids(usize),
}

/// Possible errors that can occur in the process of connecting to a Jetstream instance over
/// WebSockets.
///
/// See [JetstreamConnector::connect](crate::JetstreamConnector::connect).
#[derive(Error, Debug)]
pub enum ConnectionError {
    #[error("invalid endpoint: {0}")]
    InvalidEndpoint(#[from] url::ParseError),
    #[error("failed to connect to Jetstream instance: {0}")]
    WebSocketFailure(#[from] tokio_tungstenite::tungstenite::Error),
    #[error("the Jetstream config is invalid (this really should not happen here): {0}")]
    InvalidConfig(#[from] ConfigValidationError),
}

/// Possible errors that can occur when receiving events from a Jetstream instance over WebSockets.
///
/// See [websocket_task](crate::websocket_task).
#[derive(Error, Debug)]
pub enum JetstreamEventError {
    #[error("received websocket message that could not be deserialized as JSON: {0}")]
    ReceivedMalformedJSON(#[from] serde_json::Error),
    #[error("failed to load built-in zstd dictionary for decoding: {0}")]
    CompressionDictionaryError(io::Error),
    #[error("failed to decode zstd-compressed message: {0}")]
    CompressionDecoderError(io::Error),
    #[error("all receivers were dropped but the websocket connection failed to close cleanly")]
    WebSocketCloseFailure,
}
