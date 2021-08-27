/*
 * If not stated otherwise in this file or this component's LICENSE file the
 * following copyright and licenses apply:
 *
 * Copyright 2020 Metrological
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import test from 'tape'
import Websocket from 'ws'

import ThunderJS from '../src/thunderJS'
import sinon from 'sinon'

const port = 2021
const port2 = 2022
let messages = {}

const startServer = (port_) => {
  // create a websocket server
  const server = new Websocket.Server({
    port: port_,
  })

  server.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
      messages[port_] = message
      message = JSON.parse(message)
      message.result = 'some result for '+message.method
      ws.send(JSON.stringify(message))
    })
  })

  return server
}

// on connect event should be called when ws connection is established
test('thunderJS - connect - callback when opening connection', assert => {
  const server = startServer(port)

  const thunderJS = ThunderJS({
    host: 'localhost',
    port,
    endpoint: '/',
  })

  // register callbacks for connect and disconnect
  const connectCallbackFake = sinon.fake()
  thunderJS.on('connect', connectCallbackFake)

  const disconnectCallbackFake = sinon.fake()
  thunderJS.on('disconnect', disconnectCallbackFake)

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
        disconnectCallbackFake.callCount,
        1,
        'Disconnect callback should be called once after connection is closed'
      )
      assert.end()
    }, 1000)
  }, 1000)
})

// different instances should support connections to different servers
test('thunderJS - connect - support connections to different servers', assert => {
  const server = startServer(port)
  const server2 = startServer(port2)

  const thunderJS = ThunderJS({
    host: 'localhost',
    port,
    endpoint: '/',
  })

  // make a dummy API call
  let reply1 = {}
  thunderJS.call('Foo', 'bar').then(result => {
    reply1 = result
  }).catch(err => {
    assert.fail('Call Foo.1.bar() failed')
  })

  // thunderJS instance for server2
  const thunderJS2 = ThunderJS({
    host: 'localhost',
    port: port2,
    endpoint: '/endpoint2',
  })

  // make a dummy API call
  let reply2 = {}
  thunderJS2.call('Foo2', 'bar2').then(result => {
    reply2 = result
  }).catch(err => {
    assert.fail('Call Foo2.1.bar2() failed')
  })

  // give it some time to execute the callback
  setTimeout(() => {
    assert.match(messages[port] || '', /Foo.1.bar/, 'Server1 should receive the message')
    assert.equals(reply1, 'some result for Foo.1.bar', 'Result of Foo.1.bar() OK')
    assert.match(messages[port2] || '', /Foo2.1.bar2/, 'Server2 should receive the message')
    assert.equals(reply2, 'some result for Foo2.1.bar2', 'Result of Foo2.1.bar2() OK')

    // make a call to server1 again
    let reply3 = {}
    thunderJS.call('Foox', 'dummy').then(result => {
      reply3 = result
    }).catch(err => {
      assert.fail('Call Foox.1.dummy() failed')
    })

    setTimeout(() => {
      assert.match(messages[port] || '', /Foox.1.dummy/, 'Server1 should receive the third message')
      assert.equals(reply3, 'some result for Foox.1.dummy', 'Result of Foox.1.dummy() OK')

      // close the websocket
      server.close()
      server2.close()

      assert.end()
    }, 1000)
  }, 1000)
})
