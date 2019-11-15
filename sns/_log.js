let log

try {
  log = require('../log')
} catch (e) {
  log = console
  log.debug('logger not available. using console')
}

module.exports = log