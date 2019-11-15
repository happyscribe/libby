const AWSXRay = require('aws-xray-sdk-core')
const AWS = process.env.LAMBDA_RUNTIME_DIR
  ? AWSXRay.captureAWS(require('aws-sdk'))
  : require('aws-sdk')
const requestContext = require('./_requestContext')

module.exports = (TopicArn, message, awsOptions) => {
  const sns = new AWS.SNS(awsOptions)

  const params = {
    TopicArn,
    Message: JSON.stringify(message),
    MessageAttributes: {}
  }

  // if requestContext is loaded, get the context and include it in the Sns
  if (requestContext) {
    const context = requestContext.get()
    for (let key in context) {
      params.MessageAttributes[key] = {
        DataType: 'String',
        StringValue: context[key]
      }
    }
  }

  return sns.publish(params).promise()
}