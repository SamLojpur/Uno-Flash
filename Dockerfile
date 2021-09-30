# docker build -t uno-flash-test-image .
# docker run -it --rm -p 3030:3030 -e PORT=3030 --name uno-flash-test-run uno-flash-test-image

# docker run -it uno-flash-test-image sh
# docker stop uno-flash-test-run && docker rm uno-flash-test-run
FROM node:12.18.1 as npm-builder
WORKDIR /uno-flash
COPY client .
# RUN npm install
RUN yarn build .

FROM rust:latest as rust-builder
# Prevent complete rebuild of all dependencies when only src has changed
RUN USER=root cargo new --bin uno-flash
WORKDIR /uno-flash
COPY server/Cargo.toml Cargo.toml
COPY server/Cargo.lock Cargo.lock
RUN cargo build --release
RUN rm src/*.rs

COPY server/src src
RUN cargo build --release

FROM debian:buster-slim
RUN apt-get update \
    && apt-get install -y ca-certificates tzdata \
    && rm -rf /var/lib/apt/lists/*
COPY --from=rust-builder /uno-flash/target/release/uno-flash /uno-flash/uno-flash
COPY --from=npm-builder /uno-flash/build /uno-flash/client

EXPOSE $PORT
WORKDIR /uno-flash
CMD ["./uno-flash"]