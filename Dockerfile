# docker build -t uno-flash-test-image .
# docker run -it --rm -p 3030:3030 -e PORT=3030 --name uno-flash-test-run uno-flash-test-image

# docker run -it uno-flash-test-image sh
# docker stop uno-flash-test-run && docker rm uno-flash-test-run
FROM node:12.18.1 as npm-builder

WORKDIR /uno-flash
COPY client .
RUN npm run build .

FROM rust:latest as rust-builder 

WORKDIR /uno-flash
COPY server .
RUN cargo install --path .

FROM debian:buster-slim

RUN apt-get update \
    && apt-get install -y ca-certificates tzdata \
    && rm -rf /var/lib/apt/lists/*
COPY --from=rust-builder /uno-flash/target/release/uno-flash /uno-flash/uno-flash
COPY --from=npm-builder /uno-flash/build /uno-flash/client
EXPOSE $PORT

WORKDIR /uno-flash
CMD ["./uno-flash"]