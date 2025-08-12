#![allow(dead_code)]
pub mod error;
pub mod event;

use std::io::{Cursor, Read};

use atrium_api::types::string::Did;
use chrono::Utc;
use error::{ConfigValidationError, ConnectionError, JetstreamEventError};
use event::JetstreamEvent;
use futures_util::stream::StreamExt;
use tokio::net::TcpStream;
use tokio_tungstenite::{connect_async, tungstenite::Message, MaybeTlsStream, WebSocketStream};
use url::Url;
use zstd::dict::DecoderDictionary;

/// The Jetstream endpoints officially provided by Bluesky themselves.
///
/// There are no guarantees that these endpoints will always be available, but you are free
/// to run your own Jetstream instance in any case.
pub enum DefaultJetstreamEndpoints {
    /// `jetstream1.us-east.bsky.network`
    USEastOne,
    /// `jetstream2.us-east.bsky.network`
    USEastTwo,
    /// `jetstream1.us-west.bsky.network`
    USWestOne,
    /// `jetstream2.us-west.bsky.network`
    USWestTwo,
}

impl From<DefaultJetstreamEndpoints> for String {
    fn from(endpoint: DefaultJetstreamEndpoints) -> Self {
        match endpoint {
            DefaultJetstreamEndpoints::USEastOne => {
                "wss://jetstream1.us-east.bsky.network/subscribe".to_owned()
            }
            DefaultJetstreamEndpoints::USEastTwo => {
                "wss://jetstream2.us-east.bsky.network/subscribe".to_owned()
            }
            DefaultJetstreamEndpoints::USWestOne => {
                "wss://jetstream1.us-west.bsky.network/subscribe".to_owned()
            }
            DefaultJetstreamEndpoints::USWestTwo => {
                "wss://jetstream2.us-west.bsky.network/subscribe".to_owned()
            }
        }
    }
}

/// The maximum number of wanted collections that can be requested on a single Jetstream connection.
const MAX_WANTED_COLLECTIONS: usize = 100;
/// The maximum number of wanted DIDs that can be requested on a single Jetstream connection.
const MAX_WANTED_DIDS: usize = 10_000;

/// The custom `zstd` dictionary used for decoding compressed Jetstream messages.
///
/// Sourced from the [official Bluesky Jetstream repo.](https://github.com/bluesky-social/jetstream/tree/main/pkg/models)
const JETSTREAM_ZSTD_DICTIONARY: &[u8] = include_bytes!("../zstd_dictionary");

/// A receiver channel for consuming Jetstream events.
pub type JetstreamReceiver = flume::Receiver<Result<JetstreamEvent, JetstreamEventError>>;

/// An internal sender channel for sending Jetstream events to [JetstreamReceiver]'s.
type JetstreamSender = flume::Sender<Result<JetstreamEvent, JetstreamEventError>>;

/// A wrapper connector type for working with a WebSocket connection to a Jetstream instance to
/// receive and consume events. See [JetstreamConnector::connect] for more info.
pub struct JetstreamConnector {
    /// The configuration for the Jetstream connection.
    config: JetstreamConfig,
}

pub enum JetstreamCompression {
    /// No compression, just raw plaintext JSON.
    None,
    /// Use the `zstd` compression algorithm, which can result in a ~56% smaller messages on
    /// average. See [here](https://github.com/bluesky-social/jetstream?tab=readme-ov-file#compression) for more info.
    Zstd,
}

impl From<JetstreamCompression> for bool {
    fn from(compression: JetstreamCompression) -> Self {
        match compression {
            JetstreamCompression::None => false,
            JetstreamCompression::Zstd => true,
        }
    }
}

pub struct JetstreamConfig {
    /// A Jetstream endpoint to connect to with a WebSocket Scheme i.e.
    /// `wss://jetstream1.us-east.bsky.network/subscribe`.
    pub endpoint: String,
    /// A list of collection [NSIDs](https://atproto.com/specs/nsid) to filter events for.
    ///
    /// An empty list will receive events for *all* collections.
    ///
    /// Regardless of desired collections, all subscribers receive
    /// [AccountEvent](events::account::AccountEvent) and
    /// [IdentityEvent](events::identity::Identity) events.
    pub wanted_collections: Vec<String>,
    /// A list of repo [DIDs](https://atproto.com/specs/did) to filter events for.
    ///
    /// An empty list will receive events for *all* repos, which is a lot of events!
    pub wanted_dids: Vec<Did>,
    /// The compression algorithm to request and use for the WebSocket connection (if any).
    pub compression: JetstreamCompression,
    /// An optional timestamp to begin playback from.
    ///
    /// An absent cursor or a cursor from the future will result in live-tail operation.
    ///
    /// When reconnecting, use the time_us from your most recently processed event and maybe
    /// provide a negative buffer (i.e. subtract a few seconds) to ensure gapless playback.
    pub cursor: Option<chrono::DateTime<Utc>>,
}

impl Default for JetstreamConfig {
    fn default() -> Self {
        JetstreamConfig {
            endpoint: DefaultJetstreamEndpoints::USEastOne.into(),
            wanted_collections: Vec::new(),
            wanted_dids: Vec::new(),
            compression: JetstreamCompression::None,
            cursor: None,
        }
    }
}

impl JetstreamConfig {
    /// Constructs a new endpoint URL with the given [JetstreamConfig] applied.
    pub fn construct_endpoint(&self, endpoint: &String) -> Result<Url, url::ParseError> {
        let did_search_query = self
            .wanted_dids
            .iter()
            .map(|s| ("wantedDids", s.to_string()));

        let collection_search_query = self
            .wanted_collections
            .iter()
            .map(|s| ("wantedCollections", s.to_string()));

        let compression = (
            "compress",
            match self.compression {
                JetstreamCompression::None => "false".to_owned(),
                JetstreamCompression::Zstd => "true".to_owned(),
            },
        );

        let cursor = self
            .cursor
            .map(|c| ("cursor", c.timestamp_micros().to_string()));

        let params = did_search_query
            .chain(collection_search_query)
            .chain(std::iter::once(compression))
            .chain(cursor.into_iter())
            .collect::<Vec<(&str, String)>>();

        Url::parse_with_params(&endpoint, params)
    }

    /// Validates the configuration to make sure it is within the limits of the Jetstream API.
    ///
    /// # Constants
    /// The following constants are used to validate the configuration and should only be changed
    /// if the Jetstream API has itself changed.
    /// - [MAX_WANTED_COLLECTIONS]
    /// - [MAX_WANTED_DIDS]
    pub fn validate(&self) -> Result<(), ConfigValidationError> {
        let collections = self.wanted_collections.len();
        let dids = self.wanted_dids.len();

        if collections > MAX_WANTED_COLLECTIONS {
            return Err(ConfigValidationError::TooManyWantedCollections(collections));
        }

        if dids > MAX_WANTED_DIDS {
            return Err(ConfigValidationError::TooManyDids(dids));
        }

        Ok(())
    }
}

impl JetstreamConnector {
    /// Create a Jetstream connector with a valid [JetstreamConfig].
    ///
    /// After creation, you can call [connect] to connect to the provided Jetstream instance.
    pub fn new(config: JetstreamConfig) -> Result<Self, ConfigValidationError> {
        // We validate the configuration here so any issues are caught early.
        config.validate()?;
        Ok(JetstreamConnector { config })
    }

    /// Connects to a Jetstream instance as defined in the [JetstreamConfig].
    ///
    /// A [JetstreamReceiver] is returned which can be used to respond to events. When all instances
    /// of this receiver are dropped, the connection and task are automatically closed.
    pub async fn connect(&self) -> Result<JetstreamReceiver, ConnectionError> {
        // We validate the config again for good measure. Probably not necessary but it can't hurt.
        self.config
            .validate()
            .map_err(ConnectionError::InvalidConfig)?;

        // TODO: Run some benchmarks and look into using a bounded channel instead.
        let (send_channel, receive_channel) = flume::unbounded();

        let configured_endpoint = self
            .config
            .construct_endpoint(&self.config.endpoint)
            .map_err(ConnectionError::InvalidEndpoint)?;

        log::info!("Connecting to Jetstream endpoint: {}", configured_endpoint);

        let (ws_stream, _) = connect_async(configured_endpoint.as_str())
            .await
            .map_err(ConnectionError::WebSocketFailure)?;

        let dict = DecoderDictionary::copy(JETSTREAM_ZSTD_DICTIONARY);

        tokio::task::spawn(websocket_task(dict, ws_stream, send_channel));

        Ok(receive_channel)
    }
}

/// The main task that handles the WebSocket connection and sends [JetstreamEvent]'s to any
/// receivers that are listening for them.
async fn websocket_task(
    dictionary: DecoderDictionary<'_>,
    ws: WebSocketStream<MaybeTlsStream<TcpStream>>,
    send_channel: JetstreamSender,
) -> Result<(), JetstreamEventError> {
    // TODO: Use the write half to allow the user to change configuration settings on the fly.
    let (_, mut read) = ws.split();
    loop {
        match read.next().await {
            None => {
                log::error!("The WebSocket connection was closed unexpectedly.");
                return Err(JetstreamEventError::WebSocketCloseFailure);
            }

            Some(message) => {
                send_channel.send(decode_message(message, &dictionary)).map_err(|e| {
                    log::error!("All receivers for the Jetstream connection have been dropped, closing connection. {:?}", e);

                    JetstreamEventError::WebSocketCloseFailure
                })?;
            }
        }
    }
}

fn decode_message(
    message: Result<Message, tokio_tungstenite::tungstenite::Error>,
    dictionary: &DecoderDictionary<'_>,
) -> Result<JetstreamEvent, JetstreamEventError> {
    let json = match message {
        Ok(Message::Text(json)) => json,

        Ok(Message::Binary(zstd_json)) => {
            let mut cursor = Cursor::new(zstd_json);
            let mut decoder =
                zstd::stream::Decoder::with_prepared_dictionary(&mut cursor, &dictionary)
                    .map_err(JetstreamEventError::CompressionDictionaryError)?;

            let mut json = String::new();
            decoder
                .read_to_string(&mut json)
                .map_err(JetstreamEventError::CompressionDecoderError)?;

            json
        }

        Ok(msg) => Err(JetstreamEventError::UnexpectedEvent(msg))?,

        Err(e) => Err(JetstreamEventError::WebsocketReceiveFailure(e))?,
    };

    serde_json::from_str::<JetstreamEvent>(&json)
        .map_err(|e| JetstreamEventError::ReceivedMalformedJSON { error: e, json })
}
