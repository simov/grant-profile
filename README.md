
# grant-profile

> _User profile middleware for **[Grant]**._

```js
var express = require('express')
var session = require('express-session')
var grant = require('grant-express') // or require('grant').express()
var profile = require('grant-profile').express()
var config = require('./config.json')

express()
  .use(session())
  .use(grant(config))
  .use(profile(config))
  .use('/hi', (req, res) => {
    var {response, profile} = req.session.grant
    res.end(JSON.stringify({response, profile}, null, 2))
  })
  .listen(3000)
```

```json
{
  "defaults": {
    "protocol": "http",
    "host": "localhost:3000",
    "transport": "session",
    "callback": "/hi"
  },
  "google": {"key": "...", "secret": "..."},
  "twitter": {"key": "...", "secret": "..."}
}
```


  [grant]: https://github.com/simov/grant
  [session]: https://github.com/simov/grant#session
