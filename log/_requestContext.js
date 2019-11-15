// https://theburningmonk.com/2017/09/capture-and-forward-correlation-ids-through-different-lambda-event-sources/

let requestContext

try {
  requestContext = require('../reqContext')
} catch (e) {
  console.log('requestContext not available') 
}

module.exports = requestContext