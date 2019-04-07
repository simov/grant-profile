
# grant-profile

> _User profile middleware for **[Grant]**_

- `grant-profile` accepts your Grant configuration.
- For Express and Koa `grant-profile` needs to be mounted after Grant and before any of the callback URLs defined in your Grant configuration
- The result of `grant-profile` is always returned in the [session] as `profile` key

> _Currently not all of the supported providers in Grant are tested here, or have correct profile URLs. Check out the [profile] configuration for current status._

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
var mount = require('koa-mount')
var grant = require('grant-koa') // or require('grant').koa()
var profile = require('grant-profile').koa()
var config = require('./config.json')

var app = new Koa()
app.keys = ['grant']
app.use(session(app))
app.use(mount(grant(config)))
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

## Configuration

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


  [grant]: https://github.com/simov/grant
  [session]: https://github.com/simov/grant#session
  [profile]: https://github.com/simov/grant-profile/blob/master/config/profile.json
