
var qs = require('qs')

var Hapi = require('hapi')
var yar = require('yar')

var grant = require('grant').hapi()()
var profile = require('../../').hapi()()

var url = (path) => `http://localhost:3000${path}`


module.exports = (config) => new Promise((resolve, reject) => {
  var server = new Hapi.Server({host: 'localhost', port: 3000})
  // oauth
  server.route({method: 'POST', path: '/request_url', handler: (req, res) => {
    return res.response(qs.stringify({oauth_token: 'token'}))
      .code(200)
      .header('content-type', 'application/x-www-form-urlencoded')
  }})
  server.route({method: 'GET', path: '/authorize_url', handler: (req, res) => {
    return res.redirect(url('/connect/grant/callback?') +
      qs.stringify({
        code: 'code',
        oauth_token: 'oauth_token'
      }))
  }})
  server.route({method: 'POST', path: '/access_url', handler: (req, res) => {
    return res.response(JSON.stringify({
        access_token: 'access_token',
        oauth_token: 'oauth_token',
      }))
      .code(200)
      .header('content-type', 'application/json')
  }})
  // profile
  server.route({method: 'GET', path: '/profile_url', handler: (req, res) => {
    return res.response(req.headers.authorization)
      .code(200)
      .header('content-type', 'text/plain')
  }})
  // grant
  server.route({method: 'GET', path: '/hi', handler: (req, res) => {
    return res.response(JSON.stringify(req.yar.get('grant').profile))
      .code(200)
      .header('content-type', 'application/json')
  }})
  // other
  server.route({method: 'GET', path: '/hey', handler: (req, res) => {
    return res.response('hey')
      .code(200)
      .header('content-type', 'text/plain')
  }})

  server.register([
    {plugin: grant, options: config},
    {plugin: profile, options: config},
    {plugin: yar, options: {cookieOptions: {password: '01234567890123456789012345678912', isSecure: false}}},
  ])
  .then(() => {
    server.start().then(() => resolve(server)).catch(reject)
  })
  .catch(reject)
})
