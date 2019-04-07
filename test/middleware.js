
var t = require('assert').strict
var request = require('request-compose').extend({
  Request: {cookie: require('request-cookie').Request},
  Response: {cookie: require('request-cookie').Response},
}).client

var middleware = {
  express: require('./middleware/express'),
  koa: require('./middleware/koa'),
  hapi: require('./middleware/hapi'),
}

var url = (path) => `http://localhost:3000${path}`

var config = {
  defaults: {
    callback: '/hi',
  },
  grant: {
    authorize_url: url('/authorize_url'),
    access_url: url('/access_url'),
    oauth: 2,
  },
  facebook: {
    authorize_url: url('/authorize_url'),
    access_url: url('/access_url'),
  },
  google: {
    authorize_url: url('/authorize_url'),
    access_url: url('/access_url'),
  },
  twitter: {
    request_url: url('/request_url'),
    authorize_url: url('/authorize_url'),
    access_url: url('/access_url'),
  }
}
var profiles = require('../config/profile')
profiles.facebook.url = ''
profiles.google.url = url('/profile_url')
profiles.twitter.url = url('/profile_url')


describe('middleware', () => {

  ;['express', 'koa', 'hapi'].forEach((name) => {
    describe(name, () => {
      var server, consumer = name
      before(async () => {
        server = await middleware[consumer](config)
      })

      it('not implemented - missing provider', async () => {
        var {res, body} = await request({
          url: url('/connect/grant'),
          cookie: {}
        })
        t.deepEqual(
          body,
          {error: 'grant-profile: Not implemented!'}
        )
      })

      it('not implemented - missing url', async () => {
        var {res, body} = await request({
          url: url('/connect/facebook'),
          cookie: {}
        })
        t.deepEqual(
          body,
          {error: 'grant-profile: Not implemented!'}
        )
      })

      it('oauth2 - success', async () => {
        var {res, body} = await request({
          url: url('/connect/google'),
          cookie: {}
        })
        t.equal(
          body,
          'Bearer access_token'
        )
      })

      it('oauth1 - success', async () => {
        var {res, body} = await request({
          url: url('/connect/twitter'),
          cookie: {}
        })
        t.ok(
          /oauth_token="oauth_token"/.test(body)
        )
      })

      it('skip on missing session', async () => {
        var {res, body} = await request({
          url: url('/hey'),
        })
        t.equal(body, 'hey')
      })

      after((done) => {
        /express|koa/.test(consumer)
          ? server.close(done)
          : server.stop().then(done)
      })
    })
  })

})
