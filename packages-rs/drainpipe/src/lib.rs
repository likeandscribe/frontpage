pub mod db;
pub mod firehose;
pub mod schema;

use debug_ignore::DebugIgnore;
use diesel::{
    backend::Backend,
    deserialize::{FromSql, FromSqlRow},
    expression::AsExpression,
    serialize::ToSql,
    sql_types::Integer,
};

#[repr(i32)]
#[derive(Debug, AsExpression, PartialEq, FromSqlRow)]
#[diesel(sql_type = Integer)]
pub enum ProcessErrorKind {
    DecodeError,
    ProcessError,
}

impl<DB> ToSql<Integer, DB> for ProcessErrorKind
where
    i32: ToSql<Integer, DB>,
    DB: Backend,
{
    fn to_sql<'b>(
        &'b self,
        out: &mut diesel::serialize::Output<'b, '_, DB>,
    ) -> diesel::serialize::Result {
        match self {
            ProcessErrorKind::DecodeError => 0.to_sql(out),
            ProcessErrorKind::ProcessError => 1.to_sql(out),
        }
    }
}

impl<DB> FromSql<Integer, DB> for ProcessErrorKind
where
    DB: Backend,
    i32: FromSql<Integer, DB>,
{
    fn from_sql(bytes: <DB as Backend>::RawValue<'_>) -> diesel::deserialize::Result<Self> {
        match i32::from_sql(bytes)? {
            0 => Ok(ProcessErrorKind::DecodeError),
            1 => Ok(ProcessErrorKind::ProcessError),
            x => Err(format!("Unrecognized variant {}", x).into()),
        }
    }
}

#[derive(Debug)]
pub struct ProcessError {
    pub seq: i64,
    pub inner: anyhow::Error,
    pub source: DebugIgnore<Vec<u8>>,
    pub kind: ProcessErrorKind,
}
