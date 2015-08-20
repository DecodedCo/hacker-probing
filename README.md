# labs-js

A barebones Node.js app for labs using [Express 4](http://expressjs.com/).

This application supports the [Getting Started with Node on Heroku](https://devcenter.heroku.com/articles/getting-started-with-nodejs) article - check it out.

## Running Locally

Make sure you have [Node.js](http://nodejs.org/) and the [Heroku Toolbelt](https://toolbelt.heroku.com/) installed.

```sh
$ git clone git@github.com:decoded/labs-js.git <project-category>-<project-name>
$ cd node-js-getting-started
$ npm install
$ npm start
```

Your app should now be running on [localhost:5000](http://localhost:5000/).

## Setting up the labs server routing config
To finish setting up your project, return to the documentation at https://github.com/decodedco/labs

## Setting up the database

Heroku supports a postgres database with up to 10,000 rows on the free tier. To enable it, run:

```sh
heroku addons:create heroku-postgresql:hobby-dev
```

To run commands on the database (e.g. to create tables):
```sh
heroku pg:psql
```

### Local db setup

Install and open [postgress.app](http://postgresapp.com/)

Create a database:

```sh
$ psql
$ create database <project-category>_<project-name>;
$ <Ctrl>+<d> # to exit postgres shell
```

Setup your environment variable (**this needs to be run for each new terminal session**)

```sh
$ export DATABASE_URL=postgres://localhost:5432/<project-category>_<project-name>
```

Restart your local server:

```sh
$ npm start
```

A database connection example is at [localhost:5000/db](http://localhost:5000/db) (You'll need to create a table with data - see the [heroku tutorial page](https://devcenter.heroku.com/articles/getting-started-with-nodejs#provision-a-database) for more on this.)

The code for connecting to the database is in `index.js`.

## Documentation

For more information about using Node.js on Heroku, see these Dev Center articles:

- [Getting Started with Node.js on Heroku](https://devcenter.heroku.com/articles/getting-started-with-nodejs)
- [Heroku Node.js Support](https://devcenter.heroku.com/articles/nodejs-support)
- [Node.js on Heroku](https://devcenter.heroku.com/categories/nodejs)
- [Best Practices for Node.js Development](https://devcenter.heroku.com/articles/node-best-practices)
- [Using WebSockets on Heroku with Node.js](https://devcenter.heroku.com/articles/node-websockets)
