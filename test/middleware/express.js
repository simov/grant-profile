
var qs = require('qs')

var express = require('express')
var session = require('express-session')

var grant = require('grant').express()
var profile = require('../../').express()

var url = (path) => `http://localhost:3000${path}`


module.exports = (config) => new Promise((resolve) => {
  var server = express()
    // oauth
    .post('/request_url', (req, res) => {
      res.writeHead(200, {'content-type': 'application/x-www-form-urlencoded'})
      res.end(qs.stringify({oauth_token: 'token'}))
    })
    .get('/authorize_url', (req, res) => {
      res.redirect(url('/connect/grant/callback?') +
        qs.stringify({
          code: 'code',
          oauth_token: 'oauth_token'
        })
      )
    })
    .post('/access_url', (req, res) => {
      res.end(JSON.stringify({
        access_token: 'access_token',
        oauth_token: 'oauth_token',
      }))
    })
    // profile
    .get('/profile_url', (req, res) => {
      res.end(req.headers.authorization)
    })
    // grant
    .use(session({secret: 'grant', saveUninitialized: true, resave: true}))
    .use(grant(config))
    .use(profile(config))
    .use('/hi', (req, res) => {
      res.json(req.session.grant.profile)
    })
    // other
    .use('/hey', (req, res) => {
      res.end('hey')
    })
    .listen(3000, () => resolve(server))
})
