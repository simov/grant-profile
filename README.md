
# grant-profile

<!-- [![npm-version]][npm] [![travis-ci]][travis] [![coveralls-status]][coveralls] -->

> _User Profile plugin for **[Grant]**_

__NOTE:__ For grant-profile as a middleware for Express, Koa, and Hapi see [v0.x branch][v0]


## Use

Pass your [Grant configuration] as the `config` key, and the grant-profile plugin as item in the `extend` array:

```js
var Grant = require('grant-express|koa|hapi')
var grant = Grant({
  config: require('./config.json'),
  extend: [require('grant-profile')]
})
```

## Configuration

Grant Profile supports one additional configuration option called `profile_url`, that can be set for any provider.

The `profile_url` have to be set for [custom providers].

It also can be used to override or set the `profile_url` for existing providers. Note that in some cases a custom logic might be needed for the internal [HTTP client].

> Not all of the supported providers in Grant are tested here, or have the correct profile URL set. Check out the [configuration][profile-config] for current status.

## Response Data

Additional `profile` key will be added to your [response data] containing the user profile.


  [npm-version]: https://img.shields.io/npm/v/grant-profile.svg?style=flat-square (NPM Version)
  [travis-ci]: https://img.shields.io/travis/simov/grant-profile/master.svg?style=flat-square (Build Status)
  [coveralls-status]: https://img.shields.io/coveralls/simov/grant-profile.svg?style=flat-square (Test Coverage)

  [npm]: https://www.npmjs.com/package/grant-profile
  [travis]: https://travis-ci.org/simov/grant-profile
  [coveralls]: https://coveralls.io/r/simov/grant-profile?branch=master

  [grant]: https://github.com/simov/grant
  [grant configuration]: https://github.com/simov/grant#configuration
  [custom providers]: https://github.com/simov/grant#misc-custom-providers
  [response data]: https://github.com/simov/grant#callback-data

  [v0]: https://github.com/simov/grant-profile/tree/v0
  [profile-config]: https://github.com/simov/grant-profile/blob/master/config/profile.json
  [http client]: https://github.com/simov/grant-profile/blob/master/profile.js
