
var t = require('assert').strict
var request = require('request-compose').extend({
  Request: {cookie: require('request-cookie').Request},
  Response: {cookie: require('request-cookie').Response},
}).client

var port = {oauth1: 5000, oauth2: 5001, app: 5002}
var url = {
  oauth1: (path) => `http://localhost:${port.oauth1}${path}`,
  oauth2: (path) => `http://localhost:${port.oauth2}${path}`,
  app: (path) => `http://localhost:${port.app}${path}`,
}

var provider = require('./util/provider')
var client = require('./util/client')


describe('middleware', () => {
  var server = {oauth1: null, oauth2: null}

  before(async () => {
    server.oauth1 = await provider.oauth1(port.oauth1)
    server.oauth2 = await provider.oauth2(port.oauth2)
  })

  after((done) => {
    server.oauth1.close(() => server.oauth2.close(done))
  })

  ;['express', 'koa', 'hapi'].forEach((name) => {
    describe(name, () => {
      var server, grant, consumer = name
      var config = {
        defaults: {
          protocol: 'http', host: `localhost:${port.app}`, callback: '/callback',
          transport: 'session',
        },
        grant: {
          authorize_url: url.oauth2('/authorize_url'),
          access_url: url.oauth2('/access_url'),
          oauth: 2,
        },
        facebook: {
          authorize_url: url.oauth2('/authorize_url'),
          access_url: url.oauth2('/access_url'),
        },
        google: {
          authorize_url: url.oauth2('/authorize_url'),
          access_url: url.oauth2('/access_url'),
          profile_url: url.oauth2('/profile_url') // grant
        },
        twitter: {
          request_url: url.oauth1('/request_url'),
          authorize_url: url.oauth1('/authorize_url'),
          access_url: url.oauth1('/access_url'),
        }
      }
      var profile = require('../config/profile')
      delete profile.facebook.profile_url
      profile.twitter.profile_url = url.oauth1('/profile_url') // grant-profile

      before(async () => {
        var obj = await client[consumer](config, port.app)
        server = obj.server
        grant = obj.grant
      })

      after((done) => {
        /express|koa/.test(consumer)
          ? server.close(done)
          : server.stop().then(done)
      })

      it('not implemented - missing provider', async () => {
        var {body: {session: {response, profile}}} = await request({
          url: url.app('/connect/grant'),
          cookie: {}
        })
        t.deepEqual(response, {
          access_token: 'token',
          refresh_token: 'refresh',
          raw: {
            access_token: 'token',
            refresh_token: 'refresh',
            expires_in: 3600
          }
        })
        t.deepEqual(profile, {error: 'grant-profile: Not implemented!'})
      })

      it('not implemented - missing url', async () => {
        var {body: {session: {response, profile}}} = await request({
          url: url.app('/connect/facebook'),
          cookie: {}
        })
        t.deepEqual(response, {
          access_token: 'token',
          refresh_token: 'refresh',
          raw: {
            access_token: 'token',
            refresh_token: 'refresh',
            expires_in: 3600
          }
        })
        t.deepEqual(profile, {error: 'grant-profile: Not implemented!'})
      })

      it('oauth2 - success', async () => {
        var {body: {session: {response, profile}}} = await request({
          url: url.app('/connect/google'),
          cookie: {}
        })
        t.deepEqual(response, {
          access_token: 'token',
          refresh_token: 'refresh',
          raw: {
            access_token: 'token',
            refresh_token: 'refresh',
            expires_in: 3600
          }
        })
        t.deepEqual(profile, {user: 'foo', name: 'bar'})
      })

      it('oauth1 - success', async () => {
        var {body: {session: {response, profile}}} = await request({
          url: url.app('/connect/twitter'),
          cookie: {}
        })
        t.deepEqual(response, {
          access_token: 'token',
          access_secret: 'secret',
          raw: {
            oauth_token: 'token',
            oauth_token_secret: 'secret'
          }
        })
        t.deepEqual(profile, {user: 'foo', name: 'bar'})
      })

      it('skip on missing session', async () => {
        var {res, body} = await request({
          url: url.app('/after'),
        })
        t.equal(body, 'hey')
      })
    })

  })

})
