use atrium_api::types::string::{Cid, Did, Handle, Nsid};
use chrono::Utc;
use serde::{Deserialize, Serialize};

/// Basic data that is included with every event.
#[derive(Deserialize, Serialize, Debug)]
pub struct EventInfo {
    pub did: Did,
    pub time_us: u64,
    pub kind: EventKind,
}

#[derive(Deserialize, Serialize, Debug)]
#[serde(untagged)]
pub enum JetstreamEvent {
    Commit(CommitEvent),
    Identity(IdentityEvent),
    Account(AccountEvent),
}

impl JetstreamEvent {
    pub fn info(&self) -> &EventInfo {
        match self {
            JetstreamEvent::Commit(commit) => &commit.info(),
            JetstreamEvent::Identity(identity) => &identity.info,
            JetstreamEvent::Account(account) => &account.info,
        }
    }
}

#[derive(Deserialize, Serialize, Debug)]
#[serde(rename_all = "snake_case")]
pub enum EventKind {
    Commit,
    Identity,
    Account,
}

/// An event representing a change to an account.
#[derive(Deserialize, Serialize, Debug)]
pub struct AccountEvent {
    /// Basic metadata included with every event.
    #[serde(flatten)]
    pub info: EventInfo,
    /// Account specific data bundled with this event.
    pub account: AccountData,
}

/// Account specific data bundled with an account event.
#[derive(Deserialize, Serialize, Debug)]
pub struct AccountData {
    /// Whether the account is currently active.
    pub active: bool,
    /// The DID of the account.
    pub did: Did,
    pub seq: u64,
    pub time: chrono::DateTime<Utc>,
    /// If `active` is `false` this will be present to explain why the account is inactive.
    pub status: Option<AccountStatus>,
}

/// The possible reasons an account might be listed as inactive.
#[derive(Deserialize, Serialize, Debug)]
#[serde(rename_all = "lowercase")]
pub enum AccountStatus {
    Deactivated,
    Deleted,
    Suspended,
    TakenDown,
}

/// An event representing a repo commit, which can be a `create`, `update`, or `delete` operation.
#[derive(Deserialize, Serialize, Debug)]
#[serde(untagged, rename_all = "snake_case")]
pub enum CommitEvent {
    Create {
        #[serde(flatten)]
        info: EventInfo,
        commit: CommitData,
    },
    Update {
        #[serde(flatten)]
        info: EventInfo,
        commit: CommitData,
    },
    Delete {
        #[serde(flatten)]
        info: EventInfo,
        commit: CommitInfo,
    },
}

impl CommitEvent {
    pub fn info(&self) -> &EventInfo {
        match self {
            CommitEvent::Create { info, .. } => info,
            CommitEvent::Update { info, .. } => info,
            CommitEvent::Delete { info, .. } => info,
        }
    }
}

/// The type of commit operation that was performed.
#[derive(Deserialize, Serialize, Debug)]
#[serde(rename_all = "snake_case")]
pub enum CommitType {
    Create,
    Update,
    Delete,
}

/// Basic commit specific info bundled with every event, also the only data included with a `delete`
/// operation.
#[derive(Deserialize, Serialize, Debug)]
pub struct CommitInfo {
    /// The type of commit operation that was performed.
    pub operation: CommitType,
    pub rev: String,
    pub rkey: String,
    /// The NSID of the record type that this commit is associated with.
    pub collection: Nsid,
}

/// Detailed data bundled with a commit event. This data is only included when the event is
/// `create` or `update`.
#[derive(Deserialize, Serialize, Debug)]
pub struct CommitData {
    #[serde(flatten)]
    pub info: CommitInfo,
    /// The CID of the record that was operated on.
    pub cid: Cid,
    /// The record that was operated on.
    pub record: serde_json::Value,
}

/// An event representing a change to an identity.
#[derive(Deserialize, Serialize, Debug)]
pub struct IdentityEvent {
    /// Basic metadata included with every event.
    #[serde(flatten)]
    pub info: EventInfo,
    /// Identity specific data bundled with this event.
    pub identity: IdentityData,
}

/// Identity specific data bundled with an identity event.
#[derive(Deserialize, Serialize, Debug)]
pub struct IdentityData {
    /// The DID of the identity.
    pub did: Did,
    /// The handle associated with the identity.
    pub handle: Option<Handle>,
    pub seq: u64,
    pub time: chrono::DateTime<Utc>,
}
