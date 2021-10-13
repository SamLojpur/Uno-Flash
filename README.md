## Development

Set the `DEV` environment variable to true:

```
export DEV=true
```

This allows the server to find the client build at `client/build`

`cd server`
`cargo run`

In another terminal:
`cd client`
`yarn start`

## Deploying

To deploy, first login to heroku

```
heroku login
heroku container:login
```

Then build and push the docker image

```
 docker build -t uno-flash-image .
heroku container:push web
```

Finally, deploy the new image

```
heroku container:release web
```
