import test from 'tape'

import ThunderJS from '../src/thunderJS'
import sinon from 'sinon'

// on connect event should be called when ws connection is established
test('thunderJS - error - when opening connection', assert => {
  const thunderJS = ThunderJS({
    host: 'localhost',
    port: '1234',
    endpoint: '/',
  })

  // register callbacks for connect and disconnect
  const connectCallbackFake = sinon.fake()
  thunderJS.on('connect', connectCallbackFake)

  const errorRequestFake = sinon.fake()

  // make a dummy API call to acivate connection
  thunderJS.call('Foo', 'bar').catch(() => {
    errorRequestFake()
  })

  // give it some time to execute the callback
  setTimeout(() => {
    assert.equals(
      connectCallbackFake.callCount,
      0,
      'Connect callback should be called once after connection is established'
    )
    setTimeout(() => {
      assert.equals(
        errorRequestFake.callCount,
        1,
        'Error callback should be called once after connection is closed'
      )
      assert.end()
    }, 1000)
  }, 1000)
})
