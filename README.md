
# grant-profile

[![npm-version]][npm] [![travis-ci]][travis] [![coveralls-status]][coveralls]

> _User profile middleware for **[Grant]**_

## Configuration

> **grant-profile accepts your Grant [configuration][grant-config]**

In addition to that a `profile_url` key can be specified for any provider. This can be used for custom providers, or simply to override the `profile_url` for existing one. Note that in some cases a custom logic might be needed for the internal HTTP [client].

> *Not all of the supported providers in Grant are tested here, or have the correct profile URL set. Check out the [configuration][profile-config] for current status.*

## Middlewares

For Express and Koa grant-profile needs to be mounted after Grant, and before any of the callback URLs defined in your Grant configuration.

Additionally a `profile` key is attached to your [session] containing the user profile data.

## Express

```js
var express = require('express')
var session = require('express-session')
var grant = require('grant-express') // or require('grant').express()
var profile = require('grant-profile').express()
var config = require('./config.json')

express()
  .use(session({secret: 'grant', saveUninitialized: true, resave: true}))
  .use(grant(config))
  .use(profile(config))
  .use('/hi', (req, res) => {
    var {response, profile} = req.session.grant
    res.end(JSON.stringify({response, profile}, null, 2))
  })
  .listen(3000)
```

## Koa

```js
var Koa = require('koa')
var session = require('koa-session')
var grant = require('grant-koa') // or require('grant').koa()
var profile = require('grant-profile').koa()
var config = require('./config.json')

var app = new Koa()
app.keys = ['grant']
app.use(session(app))
app.use(grant(config))
app.use(profile(config))
app.use((ctx, next) => {
  if (ctx.path === '/hi') {
    var {response, profile} = ctx.session.grant
    ctx.body = JSON.stringify({response, profile}, null, 2)
  }
})
app.listen(3000)
```

## Hapi

```js
var Hapi = require('hapi')
var yar = require('yar')
var grant = require('grant-hapi') // or require('grant').hapi()
var profile = require('grant-profile').hapi()
var config = require('./config.json')

var server = new Hapi.Server({host: 'localhost', port: 3000})

server.route({method: 'GET', path: '/hi', handler: (req, res) => {
  var {response, profile} = req.yar.get('grant')
  return res.response(JSON.stringify({response, profile}, null, 2))
  .header('content-type', 'text/plain')
}})

server.register([
  {plugin: grant(), options: config},
  {plugin: profile(), options: config},
  {plugin: yar, options: {cookieOptions: {password: '01234567890123456789012345678912', isSecure: false}}},
])
.then(() => server.start())
```

## Example

> _Used in the above examples._

```json
{
  "defaults": {
    "protocol": "http",
    "host": "localhost:3000",
    "transport": "session",
    "state": true,
    "nonce": true,
    "callback": "/hi"
  },
  "google": {"key": "..", "secret": "..", "scope": ["openid", "profile", "email"]},
  "twitter": {"key": "..", "secret": ".."}
}
```

  [npm-version]: https://img.shields.io/npm/v/grant-profile.svg?style=flat-square (NPM Version)
  [travis-ci]: https://img.shields.io/travis/simov/grant-profile/master.svg?style=flat-square (Build Status)
  [coveralls-status]: https://img.shields.io/coveralls/simov/grant-profile.svg?style=flat-square (Test Coverage)

  [npm]: https://www.npmjs.com/package/grant-profile
  [travis]: https://travis-ci.org/simov/grant-profile
  [coveralls]: https://coveralls.io/r/simov/grant-profile?branch=master

  [grant]: https://github.com/simov/grant
  [grant-config]: https://github.com/simov/grant#configuration
  [session]: https://github.com/simov/grant#session
  [profile-config]: https://github.com/simov/grant-profile/blob/master/config/profile.json
  [client]: https://github.com/simov/grant-profile/blob/master/lib/client.js
