import test from 'tape'
import Websocket from 'ws'

import ThunderJS from '../src/thunderJS'
import sinon from 'sinon'

const port = 2021

const startServer = () => {
  // create a websocket server
  const server = new Websocket.Server({
    port,
  })

  server.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {})
  })

  return server
}

// on connect event should be called when ws connection is established
test('thunderJS - connect - callback when opening connection', assert => {
  const server = startServer()

  const thunderJS = ThunderJS({
    host: 'localhost',
    port,
    endpoint: '/',
  })

  // register callbacks for connect and disconnect
  const connectCallbackFake = sinon.fake()
  thunderJS.on('connect', connectCallbackFake)

  const disConnectCallbackFake = sinon.fake()
  thunderJS.on('connect', disConnectCallbackFake)

  // make a dummy API call to acivate connection
  thunderJS.call('Foo', 'bar')

  // give it some time to execute the callback
  setTimeout(() => {
    assert.equals(
      connectCallbackFake.callCount,
      1,
      'Connect callback should be called once after connection is established'
    )
    // close the websocket
    server.close()

    setTimeout(() => {
      assert.equals(
        disConnectCallbackFake.callCount,
        1,
        'Disconnect callback should be called once after connection is closed'
      )
      assert.end()
    }, 1000)
  }, 1000)
})
