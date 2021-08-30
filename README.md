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
