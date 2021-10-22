/**
 * If not stated otherwise in this file or this component's LICENSE file the
 * following copyright and licenses apply:
 *
 * Copyright 2021 Metrological
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

'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Contra = _interopDefault(require('contra'));
var Chalk = _interopDefault(require('chalk'));
var Inquirer = _interopDefault(require('inquirer'));
var fs = _interopDefault(require('fs'));
var ThunderJS = _interopDefault(require('../..'));

const delay = 2000;
let thunderJS;
const examples = [
  next => {
    log('Promised based examples');
    setTimeout(() => {
      next();
    }, delay);
  },
  next => {
    log('Getting system info');
    thunderJS.DeviceInfo.systeminfo()
      .then(result => {
        log('Success', result);
      })
      .catch(err => {
        log('Error', err.message);
      })
      .finally(setTimeout(next, delay));
  },
  next => {
    log('Getting free ram');
    thunderJS.DeviceInfo.freeRam()
      .then(result => {
        log('Success', result);
      })
      .catch(err => {
        log('Error', err.message);
      })
      .finally(setTimeout(next, delay));
  },
  next => {
    log('Getting version');
    thunderJS.DeviceInfo.version()
      .then(result => {
        log('Success', result);
      })
      .catch(err => {
        log('Error', err.message);
      })
      .finally(setTimeout(next, delay));
  },
  next => {
    log('Getting addresses');
    thunderJS.DeviceInfo.addresses()
      .then(result => {
        log('Success', result);
      })
      .catch(err => {
        log('Error', err.message);
      })
      .finally(setTimeout(next, delay));
  },
  next => {
    log('Setting webkit URL to metrological.com');
    thunderJS.WebKitBrowser.url('http://www.metrological.com')
      .then(result => {
        log('Success', result);
      })
      .catch(err => {
        log('Error', err.message);
      })
      .finally(setTimeout(next, delay));
  },
  next => {
    log('Callback based examples');
    setTimeout(() => {
      next();
    }, delay);
  },
  next => {
    log('Getting socket info');
    thunderJS.DeviceInfo.socketinfo({}, (err, result) => {
      if (err) {
        log('Error', err);
      } else {
        log('Success', result);
      }
      setTimeout(next, delay);
    });
  },
  next => {
    log('Invoke style promise examples');
    setTimeout(() => {
      next();
    }, delay);
  },
  next => {
    log('Getting WebKitBrowser url');
    thunderJS
      .call('WebKitBrowser', 'url')
      .then(result => {
        log('Success', result);
      })
      .catch(err => {
        log('Error', err);
      })
      .finally(setTimeout(next, delay));
  },
  next => {
    log('Getting WebKitBrowser visibility');
    thunderJS
      .call('WebKitBrowser', 'visibility')
      .then(result => {
        log('Success', result);
      })
      .catch(err => {
        log('Error', err);
      })
      .finally(setTimeout(next, delay));
  },
  next => {
    log('Invoke style callback examples');
    setTimeout(() => {
      next();
    }, delay);
  },
  next => {
    log('Getting Version');
    thunderJS.call('DeviceInfo', 'version', (err, result) => {
      if (err) {
        log('Error', err);
      } else {
        log('Success', result);
      }
      setTimeout(next, delay);
    });
  },
  next => {
    log('Custom plugin examples');
    setTimeout(() => {
      next();
    }, delay);
  },
  next => {
    thunderJS.registerPlugin('custom', {
      hello() {
        return this.call('hello')
      },
    });
    thunderJS.custom
      .hello()
      .then(result => {
        log('Success', result);
      })
      .catch(err => {
        log('Error', err);
      })
      .finally(setTimeout(next, delay));
  },
];
const filename = './.host';
const host = fs.existsSync(filename) ? fs.readFileSync(filename, 'utf8') : null;
Inquirer.prompt([
  {
    name: 'host',
    message: 'Please inform the IP of your STB',
    default: host,
  },
]).then(answers => {
  fs.writeFileSync(filename, answers.host, 'utf8');
  thunderJS = ThunderJS({
    host: answers.host,
    debug: true,
  });
  Contra.series(examples, () => {
    log('All examples done');
  });
});
const log = (...args) => {
  console.log(Chalk.cyan('--------------------------------------------------------------'));
  console.log.apply(undefined, args);
  console.log(Chalk.cyan('--------------------------------------------------------------'));
};
