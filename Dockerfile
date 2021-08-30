# docker build -t uno-flash-test-image .
# docker run -it --rm -p 3030:3030 --name uno-flash-test-run uno-flash-test-image

# docker run -it uno-flash-test-image sh
# docker stop uno-flash-test-run && docker rm uno-flash-test-run
FROM rust:latest as builder 

WORKDIR /uno-flash
COPY . .

RUN cd server/uno-flash && cargo install --path .

FROM debian:buster-slim

RUN apt-get update \
    && apt-get install -y ca-certificates tzdata \
    && rm -rf /var/lib/apt/lists/*
COPY --from=builder /uno-flash/server/uno-flash/target/release /uno-flash/target/release
COPY --from=builder  /uno-flash/client/uno-flash/build /uno-flash/target/release/client


EXPOSE $PORT

WORKDIR /uno-flash/target/release
CMD ["./uno-flash"]