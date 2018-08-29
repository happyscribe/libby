const AWS = require('aws-sdk')
const requestContext = require('./_requestContext')
const sns = new AWS.SNS()

module.exports = (TopicArn, message) => {
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