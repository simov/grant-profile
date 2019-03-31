
var qs = require('qs')

var Koa = require('koa')
var session = require('koa-session')
var mount = require('koa-mount')
var koaqs = require('koa-qs')

var grant = require('grant').koa()
var profile = require('../../').koa()

var url = (path) => `http://localhost:3000${path}`


module.exports = (config) => new Promise((resolve) => {
  var app = new Koa()
  app.keys = ['grant']
  app.use(session(app))
  app.use(mount(grant(config)))
  app.use(profile(config))
  koaqs(app)
  app.use(async (ctx) => {
    // oauth
    if (ctx.path === '/request_url') {
      ctx.response.status = 200
      ctx.set('content-type', 'application/x-www-form-urlencoded')
      ctx.body = qs.stringify({oauth_token: 'token'})
    }
    else if (ctx.path === '/authorize_url') {
      ctx.response.redirect(url('/connect/grant/callback?') +
        qs.stringify({
          code: 'code',
          oauth_token: 'oauth_token'
        })
      )
    }
    else if (ctx.path === '/access_url') {
      ctx.body = JSON.stringify({
        access_token: 'access_token',
        oauth_token: 'oauth_token',
      })
    }
    // profile
    else if (ctx.path === '/profile_url') {
      ctx.body = ctx.headers.authorization
    }
    // callback
    else if (ctx.path === '/hi') {
      ctx.body = ctx.session.grant.profile
    }
    // other
    else if (ctx.path === '/hey') {
      ctx.body = 'hey'
    }
  })
  server = app.listen(3000, () => resolve(server))
})
