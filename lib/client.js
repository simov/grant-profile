
var request = require('request-compose').extend({
  Request: {oauth: require('request-oauth')}
}).client

var profile = require('../config/profile')
var pkg = require('../package')

var before = {
  arcgis: () => ({qs: {f: 'json'}}),
  constantcontact: (data, provider) => ({api_key: provider.key}),
  baidu: (data) => ({qs: {access_token: data.access_token}}),
  deezer: (data) => ({qs: {access_token: data.access_token}}),
  disqus: (data, provider) => ({qs: {api_key: provider.key}}),
  dropbox: () => ({method: 'POST'}),
  echosign: (data) => ({headers: {'Access-Token': data.access_token}}),
  flickr: (data, provider) => ({qs: {method: 'flickr.urls.getUserProfile', api_key: provider.key, format: 'json'}}),
  foursquare: (data) => ({qs: {oauth_token: data.access_token}}),
  getpocket: (data, provider) => ({json: {consumer_key: provider.key, access_token: data.access_token}}),
  instagram: (data, provider) =>
    /^\d+$/.test(provider.key)
      ? {qs: {fields: 'id,account_type,username'}}
      : {
          url: provider.profile_url || profile.instagram.profile_url_v1,
          qs: {access_token: data.access_token}
        },
  linkedin: (data) => ({headers: {'x-li-format': 'json'}}),
  mailchimp: (data) => ({qs: {apikey: data.access_token}}),
  meetup: (data) => ({qs: {member_id: 'self'}}),
  mixcloud: (data) => ({qs: {access_token: data.access_token}}),
  shopify: (data) => ({headers: {'X-Shopify-Access-Token': data.access_token}}),
  slack: (data) => ({qs: {token: data.access_token}}),
  soundcloud: (data) => ({qs: {oauth_token: data.access_token}}),
  stackexchange: (data) => ({qs: {key: data.access_token}}),
  stocktwits: (data) => ({qs: {access_token: data.access_token}}),
  trello: (data) => ({qs: {key: data.access_token}}),
  tumblr: (data) => ({qs: {api_key: data.access_token}}),
  vk: (data) => ({qs: {access_token: data.access_token, v: '5.103'}}),
  weibo: (data) => ({qs: {access_token: data.access_token}}),
  twitter: (data) => ({qs: {user_id: data.raw.user_id}}),
}

var after = {
  // incorrect content-type
  arcgis: ({res, body}) => JSON.parse(body),
  // JSONP
  flickr: ({res, body}) => JSON.parse(/^.*\((.*)\)/.exec(body)[1]),
}

module.exports = (provider, data) => {
  var options = {
    method: 'GET',
    url: provider.profile_url || profile[provider.name].profile_url,
    headers: {'user-agent': `grant-profile ${pkg.version}`},
  }

  if (provider.subdomain) {
    options.url = options.url.replace('[subdomain]', provider.subdomain)
  }

  if (provider.oauth === 2) {
    options.headers.authorization = `Bearer ${data.access_token}`
  }
  else if (provider.oauth === 1) {
    options.oauth = {
      consumer_key: provider.key,
      consumer_secret: provider.secret,
      token: data.access_token,
      token_secret: data.access_secret,
    }
  }

  if (before[provider.name]) {
    options = Object.assign(options, before[provider.name](data, provider))
  }

  return request(options)
    .then(({res, body}) =>
      after[provider.name]
        ? after[provider.name]({res, body})
        : body
    )
}
