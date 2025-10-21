use std::path::PathBuf;

use anyhow::Context;
use serde::{Deserialize, Serialize};
use sled::Tree;

#[derive(Debug, Clone)]
pub struct Store {
    db: sled::Db,
    cursor_tree: Tree,
    dead_letter_tree: Tree,
}

#[derive(Serialize, Deserialize, Debug)]
enum CursorInner {
    V1(u64),
    V2 { value: u64, recorded_at: i64 },
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Cursor(CursorInner);

impl Cursor {
    pub fn new(value: u64) -> Self {
        Self(CursorInner::V2 {
            value,
            recorded_at: chrono::Utc::now().timestamp_micros(),
        })
    }

    pub fn value(&self) -> u64 {
        match self.0 {
            CursorInner::V1(value) => value,
            CursorInner::V2 { value, .. } => value,
        }
    }

    pub fn lag_micros(&self) -> Option<i64> {
        match self.0 {
            CursorInner::V1(_) => None,
            CursorInner::V2 { recorded_at, value } => Some(recorded_at - value as i64),
        }
    }
}

#[derive(Serialize, Deserialize, Debug)]
enum DeadLetterInner {
    V1 {
        key: String,
        commit_json: String,
        error_message: String,
    },
}

#[derive(Serialize, Deserialize, Debug)]
pub struct DeadLetter(DeadLetterInner);

impl DeadLetter {
    pub fn new(key: String, commit_json: String, error_message: String) -> Self {
        Self(DeadLetterInner::V1 {
            key,
            commit_json,
            error_message,
        })
    }
}

impl Store {
    pub fn open(path: &PathBuf) -> anyhow::Result<Store> {
        let db = sled::open(path)?;
        Ok(Self {
            db: db.clone(),
            cursor_tree: db.open_tree("cursor")?,
            dead_letter_tree: db.open_tree("dead_letter")?,
        })
    }

    pub fn flush(&self) -> anyhow::Result<()> {
        self.cursor_tree.flush()?;
        self.dead_letter_tree.flush()?;
        Ok(())
    }

    pub fn set_cursor(&self, cursor: u64) -> anyhow::Result<()> {
        log::debug!("Setting cursor to {}", cursor);
        self.cursor_tree
            .insert("cursor", bincode::serialize(&Cursor::new(cursor))?)?;
        Ok(())
    }

    pub fn get_cursor(&self) -> anyhow::Result<Option<u64>> {
        self.cursor_tree
            .get("cursor")
            .context("Failed to get cursor")?
            .map(|cursor_bytes| {
                bincode::deserialize::<Cursor>(&cursor_bytes)
                    .context("Failed to deserialize cursor")
                    .map(|cursor| cursor.value())
            })
            .transpose()
    }

    pub fn get_cursor_lag_micros(&self) -> anyhow::Result<Option<i64>> {
        self.cursor_tree
            .get("cursor")
            .context("Failed to get cursor")?
            .map(|cursor_bytes| {
                bincode::deserialize::<Cursor>(&cursor_bytes)
                    .context("Failed to deserialize cursor")
                    .map(|c| c.lag_micros())
            })
            .transpose()
            .map(|l| l.flatten())
    }

    fn record_dead_letter(&self, commit_json: String, error_message: String) -> anyhow::Result<()> {
        let key = self.db.generate_id()?.to_string();
        self.dead_letter_tree.insert(
            key.clone(),
            bincode::serialize(&DeadLetter::new(key, commit_json, error_message))?,
        )?;
        Ok(())
    }

    pub fn record_dead_letter_commit(
        &self,
        commit: &jetstream::event::CommitEvent,
        error_message: String,
    ) -> anyhow::Result<()> {
        self.record_dead_letter(serde_json::to_string(commit)?, error_message)
    }

    pub fn record_dead_letter_jetstream_error(
        &self,
        error: &jetstream::error::JetstreamEventError,
    ) -> anyhow::Result<()> {
        self.record_dead_letter("null".into(), error.to_string())
    }

    pub fn get_dead_letter_messages(&self) -> anyhow::Result<Vec<DeadLetter>> {
        let mut messages = Vec::new();

        for item in self.dead_letter_tree.iter() {
            let (_key, value) = item?;
            let message: DeadLetter =
                bincode::deserialize(&value).context("Failed to deserialize dead letter")?;
            messages.push(message);
        }
        Ok(messages)
    }
}
