const { test } = require('tap')
const proxyquire = require('proxyquire')

const defaultStubs = {
  './parse': params => params
}

test('snsHandler', async assert => {
  let context
  let event

  const snsHandler = proxyquire('../snsHandler', {
    ...defaultStubs,
    './_requestContext': {
      replace: params => context = params
    }
  })

  const func = params => {
    event = params
    return Promise.resolve()
  }

  const records = [{
    context: {
      foo: 'bar',
    },
    event: {
      bar: 'baz',
    }
  }]

  await snsHandler(func)(records)
  
  assert.deepEquals(context, { foo: 'bar' }, 'sets context')
  assert.deepEquals(event, { bar: 'baz' }, 'sends event to function')
  
  assert.end()
})