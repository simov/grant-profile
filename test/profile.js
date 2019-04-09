var t = require('assert').strict
var profile = require('../')

describe('middleware', () => {
  it('exports expected properties', () => {
    t.equal(typeof profile.express, 'function')
    t.equal(typeof profile.hapi, 'function')
    t.equal(typeof profile.koa, 'function')
    t.equal(typeof profile.config, 'function')
    t.equal(typeof profile.client, 'function')
  })
})
