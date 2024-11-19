use std::path::PathBuf;

pub struct Config {
    pub store_location: PathBuf,
    pub frontpage_consumer_secret: String,
    pub frontpage_consumer_url: String,
}

impl Config {
    pub fn from_env() -> anyhow::Result<Self> {
        Ok(Self {
            store_location: PathBuf::from(std::env::var("STORE_LOCATION")?),
            frontpage_consumer_secret: std::env::var("FRONTPAGE_CONSUMER_SECRET")?,
            frontpage_consumer_url: std::env::var("FRONTPAGE_CONSUMER_URL")?,
        })
    }
}
