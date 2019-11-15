const { test } = require('tap')
const proxyquire = require('proxyquire')

const AWS = require('aws-sdk-mock')
const AWS_SDK = require('aws-sdk')
AWS.setSDKInstance(AWS_SDK)

AWS.mock('Lambda', 'invoke', (params, callback) => {
  callback(null, {
    StatusCode: 200,
    Payload: JSON.stringify(params),
  })
})

const invoke = proxyquire('../invoke', {
  './_requestContext': {
    get: () => ({
      foo: 'bar',
    })
  }
})

test('invoke', async assert => {
  const expected = {
    FunctionName: 'someFunction',
    Payload: '{"bar":"baz"}',
    ClientContext: Buffer.from('{"custom":{"foo":"bar"}}').toString('base64')
  }

  const res = await invoke('someFunction')({ bar: 'baz' })

  assert.deepEquals(res, expected, 'forwards to invoke')
})

test('invoke - without context', async assert => {

  const invoke = require('../invoke')
  
  const expected = {
    FunctionName: 'someFunction',
    Payload: '{"bar":"baz"}',
    ClientContext: Buffer.from('{"custom":{}}').toString('base64')
  }

  const res = await invoke('someFunction')({ bar: 'baz' })

  assert.deepEquals(res, expected, 'forwards to invoke')
})

test('invoke - lambda error', async assert => {
  AWS.restore('Lambda', 'invoke')
  AWS.mock('Lambda', 'invoke', (params, callback) => {
    callback(null, {
      StatusCode: 500,
      Payload: 'someError',
    })
  })

  const invoke = require('../invoke')
  
  const expected = {
    StatusCode: 500,
    Payload: 'someError',
  }

  try {
    await invoke('someFunction')({ bar: 'baz' })
    assert.fail()
  } catch (e) {
    assert.deepEquals(e, expected, 'throws error')
  }
})

test('invoke - lambda error', async assert => {
  AWS.restore('Lambda', 'invoke')
  AWS.mock('Lambda', 'invoke', (params, callback) => {
    callback(null, {
      StatusCode: 200,
      Payload: '{"errorMessage":"someError"}',
    })
  })

  const invoke = require('../invoke')
  
  try {
    await invoke('someFunction')({ bar: 'baz' })
    assert.fail()
  } catch (e) {
    assert.equals(e, 'someError', 'throws error')
  }
})