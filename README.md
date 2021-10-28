# Uno Flash!

Welcome to Uno Flash! Uno Flash is just like normal Uno with one exception: There are no turns. All players play their turn as fast as possible, clicking cards that share a color or number with the last discarded card. It can get pretty frantic!


To get started, enter a name and click 'Create Room'. You can invite other players to join your lobby using the link in your lobby. Make sure to give everyone a chance to set their own name before you start.

![Screenshot from 2021-10-27 20-26-14](https://user-images.githubusercontent.com/10664941/139177467-e8ee83c4-9600-4ac9-9bd5-c30cdf0824a8.png)

![Screenshot from 2021-10-27 20-28-25](https://user-images.githubusercontent.com/10664941/139177466-bdd5e306-90e7-4a8c-b95e-4a83c6c2ef05.png)

After that, it's go time! The goal of the game is to be the first player with no cards in hand. Players must click cards in their hand that match the color or value of the card in the discard pile. Whenever you play a card, your other cards have a brief 'cooldown' before they can be played. This cooldown is also applied to recently drawn cards. If you get stuck, you can click on the draw pile to draw more cards (or wait for someone else to play a different card 😉).


![Screenshot from 2021-10-27 20-28-58](https://user-images.githubusercontent.com/10664941/139177465-416c82cc-c698-4d0a-b692-00f7f6673cf6.png)

There are a few special cards to be aware of:

* "Block" cards add a cooldown to half of each opponent's cards
* "+2" cards force each other player to draw 2 additional cards
* "Wild" cards can be played at any time. Click on any corner of them to set the discard pile to that color

![2021-10-27-204153_5760x1357_scrot](https://user-images.githubusercontent.com/10664941/139177462-e003e4f9-599f-4fd1-a921-4bf302b7e95a.png)


## Development

(For my own reference mostly)

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

### Heroku
To deploy, first login to heroku

```
heroku login
heroku container:login
```

Then build and push the docker image (from the root folder)

```
docker build -t uno-flash-image .
heroku container:push web
```

Finally, deploy the new image

```
heroku container:release web
```
### Azure/ Private Docker Repo

```
docker login
docker build -t samlojpur/uno-flash .
docker push samlojpur/uno-flash:latest
```
