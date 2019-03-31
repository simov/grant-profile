
exports.express = () => {
  return require('./lib/consumer/express')
}

exports.koa = () => {
  return require('./lib/consumer/koa')
}

exports.hapi = () => {
  return require('./lib/consumer/hapi')
}
