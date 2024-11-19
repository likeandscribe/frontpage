use std::path::PathBuf;

use anyhow::Context;
use serde::{Deserialize, Serialize};
use sled::Tree;

pub struct Store {
    cursor_tree: Tree,
    dead_letter_tree: Tree,
}

#[derive(Serialize, Deserialize, Debug)]

enum CursorInner {
    V1(u64),
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Cursor(CursorInner);

impl Cursor {
    pub fn new(value: u64) -> Self {
        Self(CursorInner::V1(value))
    }

    pub fn value(&self) -> u64 {
        match self.0 {
            CursorInner::V1(value) => value,
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

    pub fn key(&self) -> &String {
        match &self.0 {
            DeadLetterInner::V1 { key, .. } => key,
        }
    }
}

impl Store {
    pub fn open(path: &PathBuf) -> anyhow::Result<Store> {
        let db = sled::open(path)?;
        Ok(Self {
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

    pub fn record_dead_letter(&self, dead_letter: &DeadLetter) -> anyhow::Result<()> {
        self.dead_letter_tree
            .insert(dead_letter.key(), bincode::serialize(&dead_letter)?)?;
        Ok(())
    }
}
