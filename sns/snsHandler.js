const reqContext = require('./_requestContext')
const parse = require('./parse')

module.exports = func => async ({ Records }) => {
  const parsed = parse(Records)
  
  for (let record of parsed) {
    if (reqContext)
      reqContext.replace(record.context)

    await func(record.event)
  }
}