import test from 'tape'
import sinon from 'sinon'

import ThunderJS from '../src/thunderJS'
import * as API from '../src/api/index'
import * as connect from '../src/api/connect'

const options = { host: 'localhost' }

let makeBodySpy
let apiRequestSpy
let connectStub
let makeIdStub

const resetStubsAndSpies = () => {
  makeIdStub.resetHistory()
  connectStub.resetHistory()
  apiRequestSpy.resetHistory()
  makeBodySpy.resetHistory()
}

test('Setup - thunderJS - notifications', assert => {
  makeBodySpy = sinon.spy(API, 'makeBody')
  apiRequestSpy = sinon.spy(API, 'execRequest')

  connectStub = sinon.stub(connect, 'default').callsFake(() => {
    return new Promise(resolve => {
      resolve({
        // stubbed send
        send() {},
      })
    })
  })

  makeIdStub = sinon.stub(API, 'makeId').callsFake(() => {
    // always return id of 1 to facilitate testing (in isolation)
    return 1
  })

  assert.end()
})

test('thunderJS - notification - argument based', assert => {
  resetStubsAndSpies()

  let thunderJS = ThunderJS(options)

  // make call using argument style
  thunderJS.call('DeviceInfo', 'systeminfo')

  assert.ok(
    makeBodySpy.returned(
      sinon.match({
        jsonrpc: '2.0',
        id: 1,
        method: 'DeviceInfo.1.systeminfo',
      })
    ),
    'Should make a jsonrpc body and method DeviceInfo.1.systeminfo'
  )

  assert.deepEquals(
    apiRequestSpy.firstCall.args[1],
    {
      jsonrpc: '2.0',
      id: 1,
      method: 'DeviceInfo.1.systeminfo',
    },
    'Should make a request for DeviceInfo.1.systeminfo'
  )

  assert.end()
})

test('thunderJS - notification - object based', assert => {
  resetStubsAndSpies()

  let thunderJS = ThunderJS(options)

  // make call using object style
  thunderJS.DeviceInfo.systeminfo()

  assert.ok(
    makeBodySpy.returned(
      sinon.match({
        jsonrpc: '2.0',
        id: 1,
        method: 'DeviceInfo.1.systeminfo',
      })
    ),
    'Should make a request for DeviceInfo.1.systeminfo'
  )

  assert.deepEquals(
    apiRequestSpy.firstCall.args[1],
    {
      jsonrpc: '2.0',
      id: 1,
      method: 'DeviceInfo.1.systeminfo',
    },
    'Should make a request for DeviceInfo.1.systeminfo'
  )

  assert.end()
})

test('thunderJS - notification - specifying method versions', assert => {
  resetStubsAndSpies()

  let config = {
    ...options,
    versions: {
      default: 2,
      DeviceInfo: 3,
    },
  }

  let thunderJS = ThunderJS(config)

  // default version from config
  thunderJS.Controller.activate('DeviceInfo')
  assert.ok(
    makeBodySpy.firstCall.returned(sinon.match({ method: 'Controller.2.activate' })),
    'Body of request should specify method with the version defined as default in config'
  )

  // specified plugin version in config
  thunderJS.DeviceInfo.systeminfo()
  assert.ok(
    makeBodySpy.secondCall.returned(sinon.match({ method: 'DeviceInfo.3.systeminfo' })),
    'Body of request should specify method the version of the plugin in config'
  )

  // version passed as argument
  thunderJS.DeviceInfo.systeminfo({ version: 10 })
  assert.ok(
    makeBodySpy.thirdCall.returned(sinon.match({ method: 'DeviceInfo.10.systeminfo' })),
    'Body of request should specify method with the version as passed in params'
  )

  assert.end()
})

test('thunderJS - notification - argument based - with params', assert => {
  resetStubsAndSpies()

  let thunderJS = ThunderJS(options)

  // make call using argument style
  thunderJS.call('Controller', 'activate', {
    callsign: 'DeviceInfo',
  })

  assert.ok(
    makeBodySpy.returned(
      sinon.match({
        jsonrpc: '2.0',
        id: 1,
        method: 'Controller.1.activate',
        params: {
          callsign: 'DeviceInfo',
        },
      })
    ),
    'Should make a jsonrpc body and method Controller.1.activate'
  )

  assert.deepEquals(
    apiRequestSpy.firstCall.args[1],
    {
      jsonrpc: '2.0',
      method: 'Controller.1.activate',
      id: 1,
      params: {
        callsign: 'DeviceInfo',
      },
    },
    'Should make a request for Controller.1.activate, with params'
  )

  assert.end()
})

test('thunderJS - notifications - object style - with params', assert => {
  resetStubsAndSpies()

  let thunderJS = ThunderJS(options)

  // make call using object style
  thunderJS.Controller.activate({
    callsign: 'DeviceInfo',
  })

  assert.ok(
    makeBodySpy.returned(
      sinon.match({
        jsonrpc: '2.0',
        method: 'Controller.1.activate',
        id: 1,
        params: {
          callsign: 'DeviceInfo',
        },
      })
    ),
    'Should make a jsonrpc body and method Controller.1.activate'
  )

  assert.deepEquals(
    apiRequestSpy.firstCall.args[1],
    {
      jsonrpc: '2.0',
      method: 'Controller.1.activate',
      id: 1,
      params: {
        callsign: 'DeviceInfo',
      },
    },
    'Should make a request for Controller.1.activate, with params'
  )

  assert.end()
})

test('thunderJS - notifications - argument based - different plugins in sequence', assert => {
  resetStubsAndSpies()

  let thunderJS = ThunderJS(options)

  // call Controller plugin
  thunderJS.call('Controller', 'processinfo')

  assert.ok(
    makeBodySpy.returned(
      sinon.match({
        jsonrpc: '2.0',
        id: 1,
        method: 'Controller.1.processinfo',
      })
    ),
    'Should make a jsonrpc body and method Controller.1.processinfo'
  )

  // call DeviceInfo plugin
  thunderJS.call('DeviceInfo', 'systeminfo')

  assert.ok(
    makeBodySpy.returned(
      sinon.match({
        jsonrpc: '2.0',
        id: 1,
        method: 'DeviceInfo.1.systeminfo',
      })
    ),
    'Should make a jsonrpc body and method DeviceInfo.1.systeminfo'
  )

  // call Controller plugin with arguments
  thunderJS.call('Controller', 'activate', { callsign: 'DeviceInfo' })

  assert.ok(
    makeBodySpy.returned(
      sinon.match({
        jsonrpc: '2.0',
        id: 1,
        method: 'Controller.1.activate',
        params: {
          callsign: 'DeviceInfo',
        },
      })
    ),
    'Should make a jsonrpc body and method Controller.1.activate and params'
  )

  assert.end()
})

test('thunderJS - notifications - argument based mixed with aobject based', assert => {
  resetStubsAndSpies()

  let thunderJS = ThunderJS(options)

  // call Controller plugin argument based
  thunderJS.call('Controller', 'processinfo')

  assert.ok(
    makeBodySpy.returned(
      sinon.match({
        jsonrpc: '2.0',
        id: 1,
        method: 'Controller.1.processinfo',
      })
    ),
    'Should make a jsonrpc body and method Controller.1.processinfo'
  )

  // call DeviceInfo plugin object based
  thunderJS.DeviceInfo.systeminfo()

  assert.ok(
    makeBodySpy.returned(
      sinon.match({
        jsonrpc: '2.0',
        id: 1,
        method: 'DeviceInfo.1.systeminfo',
      })
    ),
    'Should make a jsonrpc body and method DeviceInfo.1.systeminfo'
  )

  assert.end()
})

test('Teardown - thunderJS - notifications', assert => {
  makeBodySpy.restore()
  apiRequestSpy.restore()
  connectStub.restore()
  makeIdStub.restore()

  assert.end()
})
