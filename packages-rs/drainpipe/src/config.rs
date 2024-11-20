use std::{env::VarError, path::PathBuf};

use anyhow::Context;

pub struct Config {
    pub store_location: PathBuf,
    pub frontpage_consumer_secret: String,
    pub frontpage_consumer_url: String,
    pub jetstream_url: Option<String>,
}

impl Config {
    pub fn from_env() -> anyhow::Result<Self> {
        Ok(Self {
            store_location: PathBuf::from(get_var("STORE_LOCATION")?),
            frontpage_consumer_secret: get_var("FRONTPAGE_CONSUMER_SECRET")?,
            frontpage_consumer_url: get_var("FRONTPAGE_CONSUMER_URL")?,
            jetstream_url: match std::env::var("JETSTREAM_URL") {
                Ok(url) => Some(url),
                Err(VarError::NotPresent) => None,
                Err(e) => return Err(e.into()),
            },
        })
    }
}

fn get_var(name: &str) -> anyhow::Result<String> {
    std::env::var(name).context(format!("{} not set", name))
}
