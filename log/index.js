// copied from here:
// https://theburningmonk.com/2017/09/capture-and-forward-correlation-ids-through-different-lambda-event-sources/

const requestContext = require('./_requestContext')

// most of these are available through the Node.js execution environment for Lambda
// see https://docs.aws.amazon.com/lambda/latest/dg/current-supported-versions.html
const DEFAULT_PARAMS = {
  awsRegion: process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION,
  functionName: process.env.AWS_LAMBDA_FUNCTION_NAME,
  functionMemorySize: process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE,
  stage: process.env.SERVERLESS_STAGE,
}

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
}

function appendError(params={}, error) {
  if (!error) {
    return params
  }

  return {
    ...params,
    errorName: error.name,
    errorMessage: error.message,
    stackTrace: error.stack
  }
}

function log(level, message, params) {

  let context = {}
  
  // try to load the context
  if (requestContext) {
    context = requestContext.get()
  }

  // default to DEBUG
  const levelSet = context.logLevel || process.env.logLevel || 'DEBUG'

  // only log if the level is greater than what is set in context
  // i.e. dont log debug events if the level is set to warn
  if (LOG_LEVELS[level] < LOG_LEVELS[levelSet]) {
    return
  }

  let logMsg = {
    ...DEFAULT_PARAMS,
    ...context,
    ...params,
    level,
    message,
  }

  console.log(JSON.stringify(logMsg))

  // return for testing and just in case we want to check something
  return logMsg
}

module.exports = {
  debug: (msg, params) => log('DEBUG', msg, params),
  info: (msg, params) => log('INFO',  msg, params),
  warn: (msg, params, error) => log('WARN',  msg, appendError(params, error)),
  error: (msg, params, error) => log('ERROR', msg, appendError(params, error)),
}