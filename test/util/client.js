
var url = require('url')
var qs = require('qs')

var express = require('express')
var session = require('express-session')

var Koa = require('koa')
var koasession = require('koa-session')
var koaqs = require('koa-qs')

var Hapi = require('@hapi/hapi')
var yar = require('@hapi/yar')

var Grant = require('grant')
var Profile = require('../../')


module.exports = {
  express: (config, port) => new Promise((resolve) => {
    var grant = Grant.express()(config)
    var profile = Profile.express()(config)

    var app = express()
    app.use(session({secret: 'grant', saveUninitialized: true, resave: false}))
    app.use(grant)
    app.use(profile)
    app.get('/callback', (req, res) => {
      res.writeHead(200, {'content-type': 'application/json'})
      res.end(JSON.stringify({
        session: req.session.grant,
        response: req.session.grant.response || req.query,
      }))
    })
    app.use('/after', (req, res) => {
      res.end('hey')
    })

    var server = app.listen(port, () => resolve({grant, server, app}))
  }),
  koa: (config, port) => new Promise((resolve) => {
    var grant = Grant.koa()(config)
    var profile = Profile.koa()(config)

    var app = new Koa()
    app.keys = ['grant']
    app.use(koasession(app))
    app.use(grant)
    app.use(profile)
    koaqs(app)

    app.use(async (ctx) => {
      if (ctx.path === '/callback') {
        ctx.response.status = 200
        ctx.set('content-type', 'application/json')
        ctx.body = JSON.stringify({
          session: ctx.session.grant,
          response: ctx.session.grant.response || ctx.request.query,
        })
      }
      else if (ctx.path === '/after') {
        ctx.response.status = 200
        ctx.body = 'hey'
      }
    })

    var server = app.listen(port, () => resolve({grant, server, app}))
  }),
  hapi: async (config, port) => {
    var grant = Grant.hapi()(config)
    var profile = Profile.hapi()(config)

    var server = new Hapi.Server({host: 'localhost', port})
    server.route({method: 'GET', path: '/callback', handler: (req, res) => {
      return res.response({
        session: req.yar.get('grant'),
        response: req.yar.get('grant').response || qs.parse(req.query),
      })
    }})
    server.route({method: 'GET', path: '/after', handler: (req, res) => {
      return res.response('hey')
        .code(200)
        .header('content-type', 'text/plain')
    }})

    await server.register([
      {plugin: grant},
      {plugin: profile},
      {plugin: yar, options: {cookieOptions:
        {password: '01234567890123456789012345678912', isSecure: false}}}
    ])
    await server.start()

    return {grant, profile, server}
  },
}
