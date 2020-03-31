/*
 * If not stated otherwise in this file or this component's LICENSE file the
 * following copyright and licenses apply:
 *
 * Copyright 2020 RDK Management
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

import WebSocket from 'isomorphic-ws'

import requestQueueResolver from './requestQueueResolver'
import notificationListener from './notificationListener'
import makeWebsocketAddress from './makeWebsocketAddress'

const protocols = 'notification'

let socket = null

export default options => {
  return new Promise((resolve, reject) => {
    if (socket && socket.readyState === 1) {
      resolve(socket)
    } else if (!socket) {
      // create a new socket
      socket = new WebSocket(makeWebsocketAddress(options), protocols)
      socket.addEventListener('message', message => {
        requestQueueResolver(message.data)
      })
      socket.addEventListener('message', message => {
        notificationListener(message.data)
      })

      socket.addEventListener('error', m => {
        notificationListener({
          method: 'client.ThunderJS.events.error',
        })
        socket = null
        reject(m)
      })

      socket.addEventListener('open', () => {
        notificationListener({
          method: 'client.ThunderJS.events.connect',
        })
        resolve(socket)
      })

      socket.addEventListener('close', m => {
        // only send notification if we where previously connected
        if (socket) {
          notificationListener({
            method: 'client.ThunderJS.events.disconnect',
          })
          socket = null
          reject(m)
        }
      })
    } else if (socket && socket.readyState === 0) {
      // if socket is connecting, wait for the connection to be ready
      socket.addEventListener('open', () => {
        notificationListener({
          method: 'client.ThunderJS.events.connect',
        })
        resolve(socket)
      })
    } else {
      // socket must be closed or closing, reject it
      reject('Socket closing or closed')
    }
  })
}
