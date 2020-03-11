const defaultConf = require('./config.default')
const localConf = require('./config.local')
const prodConf = require('./config.prod')

const isProd = process.env.NODE_ENV === 'production'
const config = isProd ? prodConf : localConf

const hostConfig = Object.assign(defaultConf.hostConfig, config.hostConfig)
const baseConfig = Object.assign(defaultConf.baseConfig, config.baseConfig)

module.exports = { hostConfig, baseConfig }
