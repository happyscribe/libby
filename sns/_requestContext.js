// https://theburningmonk.com/2017/09/capture-and-forward-correlation-ids-through-different-lambda-event-sources/

let log = require('./_log')

let requestContext

try {
  requestContext = require('../reqContext')
} catch (e) {
  log.debug('requestContext not available') 
}

module.exports = requestContext