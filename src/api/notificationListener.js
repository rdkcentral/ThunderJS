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

import { listeners } from '../store'

export default data => {
  if (typeof data === 'string') {
    let regex1 = /\\\\x([0-9A-Fa-f]{2})/g //evaluating \\x00 pattern on hidden SSID
    let regex2 = /\\x([0-9A-Fa-f]{2})/g //evaluating \x00 pattern on hidden SSID
    data = data.normalize().replace(regex1, '')
    data = data.normalize().replace(regex2, '')
    data = JSON.parse(data)
  }
  // determine if we're dealing with a notification
  if (!data.id && data.method) {
    // if so, so see if there exist callbacks
    const callbacks = listeners[data.method]
    if (callbacks && Array.isArray(callbacks) && callbacks.length) {
      callbacks.forEach(callback => {
        if (callback) callback(data.params)
      })
    }
  }
}
