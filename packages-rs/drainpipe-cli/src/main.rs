use std::path::PathBuf;

use chrono::TimeZone;
use structopt::StructOpt;

#[derive(StructOpt, Debug)]
#[structopt(name = "drainpipe")]
enum Opt {
    SetCursor {
        #[structopt(long, env = "STORE_LOCATION", parse(from_os_str))]
        db: PathBuf,

        #[structopt(name = "TIME_US")]
        value: u64,
    },

    GetCursor {
        #[structopt(long, env = "STORE_LOCATION", parse(from_os_str))]
        db: PathBuf,
    },

    GetDeadLetterMessages {
        #[structopt(long, env = "STORE_LOCATION", parse(from_os_str))]
        db: PathBuf,
    },
}

fn main() {
    let cwd = std::env::current_dir().expect("Could not get current directory");

    dotenv_flow::from_filename(cwd.join(".env.local")).ok();
    dotenv_flow::from_filename(cwd.join(".env")).ok();

    match Opt::from_args() {
        Opt::SetCursor { db, value } => {
            let store = drainpipe_store::Store::open(&db).expect("Could not open store");
            store.set_cursor(value).expect("Could not set cursor");
            store.flush().expect("Could not flush store");
            println!("Cursor set to: {}", value);
        }

        Opt::GetCursor { db } => {
            let store = drainpipe_store::Store::open(&db).expect("Could not open store");
            if let Some(cursor) = store.get_cursor().expect("Could not get cursor") {
                println!(
                    "Cursor: {} ({:?})",
                    cursor,
                    chrono::Utc.timestamp_micros(cursor as i64).unwrap()
                );
            } else {
                println!("Cursor not set");
                std::process::exit(1);
            }
        }

        Opt::GetDeadLetterMessages { db } => {
            let store = drainpipe_store::Store::open(&db).expect("Could not open store");
            let messages = store
                .get_dead_letter_messages()
                .expect("Could not get dead letter messages");
            for message in messages {
                println!("{}", serde_json::to_string_pretty(&message).unwrap());
            }
        }
    }
}
