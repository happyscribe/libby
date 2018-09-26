const requestContext = require('./_requestContext')
const log = require('./_log')

const AWS = require('aws-sdk')

module.exports = (FunctionName, awsOptions) =>  {
  const lambda = new AWS.Lambda(awsOptions)

  return async payload => {
    const params = {
      FunctionName,
      Payload: JSON.stringify(payload),
    }

    // load any context and pass it along.
    // the context needs to be nested under a 'custom' parameter,
    // and sent as a base64 encoded string
    if (requestContext) {
      const context = { 
        custom: requestContext.get(),
      }

      // stringify and convert to base64
      params.ClientContext = Buffer.from(JSON.stringify(context)).toString('base64')
      log.debug('lambda.invoke: set outbound ClientContext from requestContext')
    }

    const res = await lambda.invoke(params).promise()

    // this only check that the lambda invocation was successfull.
    if (res.StatusCode !== 200 && res.StatusCode !== 201) {
      throw res
    }

    const parsed = JSON.parse(res.Payload)

    // we need to check for function errors here, since lambda INVOKE will return 200
    if (parsed.errorMessage) {
      throw parsed.errorMessage
    }

    return parsed
  }
}