
var grant = require('grant/lib/config')
var request = require('../client')
var profile = require('../../config/profile')


module.exports = (_config) => {
  var config = grant(_config)

  return async (ctx, next) => {
    var session = ctx.session.grant
    if (!session) {
      next()
      return
    }

    var callback = ctx.path
    var provider = grant.provider(config, session)

    var response =
      !provider.transport || provider.transport === 'querystring'
      ? ctx.request.query
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
    }

    next()
  }
}
