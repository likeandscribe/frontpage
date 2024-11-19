# Drainpipe

Drainpipe is a atproto [firehose](https://docs.bsky.app/docs/advanced-guides/firehose) consumer written in rust. It knows how to reliably<sup>\*</sup> take messages from the firehose, filter them, and forward them over HTTPs to a webhook receiver some place else on the internet.

<sup>\*totally subjective opinion.</sup>

## Building dockerfile locally

From the root of the monorepo

```
docker build -f ./packages-rs/drainpipe/Dockerfile .
```

## Deploying to fly.io

```
fly deploy . -c ./packages-rs/drainpipe/fly.toml --dockerfile ./packages-rs/drainpipe/Dockerfile
```

## Fiddling and debugging with the cursor locally

```bash
cargo drainpipe set-cursor 123 # set the cursor to 123 microseconds since epoch
cargo drainpipe get-cursor # get the current cursor
```
