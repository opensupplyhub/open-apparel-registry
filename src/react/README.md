# Ursa-minor

## An interactive map that allows people to search factories around the world.

Built with React, Redux and mapbox-gl. It sends HTTP request to [Ursa-major](https://github.com/sourcemap/ursa-major) or other APIs to get/upload factory data. It uses firebase for user authentication and store user data, and filestack for saving user profile photos.

## Usage

Create `.env.development` and `.env.production` files, take a look at `.env.sample`
Update `firebaseConfig.js` with your own firebase keys.

```
$ yarn install
$ yarn start
$ yarn build
```
Go to `localhost:3000`, you should be able to see an interactive searchable map

### More about .env file
REACT_APP_API_URL=(The url of the backend api [ursa_major](https://github.com/sourcemap/ursa_major), e.g. http://localhost:8000)

REACT_APP_API_KEY=The api key that ursa_minor app needs when it send HTTP request to ursa_major

REACT_APP_MAPBOX_TOKEN=Your mapbox token

REACT_APP_CLICKABLE_LIST=true(Enable the clickable search result list feature)

REACT_APP_MAINTENANCE=true(Show "this site is under mainrenance" page)

REACT_APP_MAP_THEME=true(Show multiple map themes)

REACT_APP_FILESTACK_KEY=Your filestack key, this app uses filestack to save user profile photos 

REACT_APP_MAP_COLOR=#1A237E

REACT_APP_MAP_COLOR_LIGHT=#bec3f7

REACT_APP_MAP_COLOR_TRANSPARENT=rgba(26, 35, 126, 0.5)

REACT_APP_MAP_COLOR_LIGHT_TRANSPARENT=rgba(190, 195, 247, 0.5)

## Deployment
In order to deploy, you need to have `firebase-tools` installed globally. To install,
just run `npm i -g firebase-tools`.

Update `firebaseConfig.js` with your own firebase keys

`$ yarn deploy`

## Create a batch of users in firebase
See the createUsers.js for more info about change firebase Rules before running this script

```
$ node createUsers.js
```
