FROM rust:1.89-alpine AS chef
RUN apk add libressl-dev musl-dev sqlite-dev
RUN cargo install cargo-chef

WORKDIR /app
FROM chef AS planner
# Assumes . is root of monorepo, so build context should be set accordingly
COPY . .
RUN cargo chef prepare  --recipe-path recipe.json

FROM chef AS builder
COPY --from=planner /app/recipe.json recipe.json
# Build dependencies - this is the caching Docker layer!
RUN cargo chef cook --release --recipe-path recipe.json
# Build application. Again, assumes . is root of monorepo.
COPY . .
RUN cargo build --release --bin drainpipe

FROM alpine:3.14
WORKDIR /app
COPY --from=builder /app/target/release/drainpipe /usr/local/drainpipe

ENV STORE_LOCATION="/drainpipedata/sled"

ENTRYPOINT ["/usr/local/drainpipe"]
