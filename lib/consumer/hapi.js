
var qs = require('qs')
var grant = require('grant/lib/config')
var request = require('../client')
var profile = require('../../config/profile')


module.exports = (_config) => {
  var app = {}

  function register (server, options) {
    var config = grant(Object.keys(options).length ? options : _config)

    server.ext('onPreHandler', async (req, res) => {
      var session = (req.session || req.yar).get('grant')
      if (!session) {
        return res.continue
      }

      var callback = req.path
      var provider = grant.provider(config, session)

      var response =
        !provider.transport || provider.transport === 'querystring'
        ? qs.parse(req.query)
        : provider.transport === 'session'
        ? session.response
        : {}

      if (provider.callback === callback) {
        if (!provider.profile_url &&
          (!profile[provider.name] || !profile[provider.name].profile_url)) {
          session.profile = {error: 'grant-profile: Not implemented!'}
        }
        else {
          try {
            session.profile = await request(provider, response)
          }
          catch (err) {
            session.profile = {error: err.body || err.message}
          }
        }
        ;(req.session || req.yar).set('grant', session)
      }
      return res.continue
    })
  }

  app.pkg = require('../../package.json')
  app.register = register
  return app
}
