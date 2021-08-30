## Development

Set the `DEV` environment variable to true:

```
export DEV=true
```

This allows the server to find the client build at `client/build`

## Deploying

To deploy, first login to heroku

```
heroku container:login
```

Then build and push the docker image

```
heroku container:push web
```

Finally, deploy the new image

```
heroku container:release web
```
