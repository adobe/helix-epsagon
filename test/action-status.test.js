/*
 * Copyright 2019 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

/* eslint-env mocha */
/* eslint-disable no-underscore-dangle */
const assert = require('assert');
const crypto = require('crypto');
const proxyquire = require('proxyquire').noPreserveCache();
const sinon = require('sinon');
const { wrap } = require('@adobe/openwhisk-action-utils');

const DEFAULT_PARAMS = {
  testParams: 'foo',
};

const simpleAction = () => 'ok';

const wrapperStub = sinon.stub().callsFake((action) => (params) => action(params));

const eventStub = sinon.stub();

let currentRunner = null;

const epsagon = proxyquire('../src/epsagon.js', {
  epsagon: {
    openWhiskWrapper: wrapperStub,
  },
  './action-status.js': proxyquire('../src/action-status.js', {
    epsagon: {
      tracer: {
        getTrace() {
          return {
            currRunner: currentRunner,
          };
        },
      },
      eventInterface: {
        addToMetadata: eventStub,
      },
    },
  }),
});

describe('Action Status Tests', () => {
  let activationId;
  beforeEach(() => {
    wrapperStub.resetHistory();
    eventStub.resetHistory();
    activationId = crypto.randomBytes(16).toString('hex');
    Object.assign(process.env, {
      __OW_ACTION_NAME: '/helix/helix-epsagon@1.0.2',
      __OW_ACTION_VERSION: '0.0.3',
      __OW_ACTIVATION_ID: activationId,
      __OW_API_HOST: 'https://runtime.adobe.io',
      __OW_NAMESPACE: 'helix-testing',
    });
  });
  afterEach(() => {
    delete process.env.__OW_ACTION_NAME;
    delete process.env.__OW_ACTION_VERSION;
    delete process.env.__OW_ACTIVATION_ID;
    delete process.env.__OW_API_HOST;
    delete process.env.__OW_NAMESPACE;
  });

  it('action status reports stats', async () => {
    currentRunner = {};
    const result = await wrap(simpleAction).with(epsagon)({
      ...DEFAULT_PARAMS,
      EPSAGON_TOKEN: '1234',
    });
    assert.equal(result, 'ok');

    const args1 = eventStub.getCall(0).args[1];
    assert.ok(args1.mem_beg);
    assert.ok(args1.container.uuid);
    assert.ok(args1.container.age);
    assert.equal(args1.container.concurrency, 1);
    assert.equal(args1.container.numInvocations, 1);

    const args2 = eventStub.getCall(1).args[1];
    assert.ok(args2.mem_end);
    assert.equal(args2.mem_delta, args2.mem_end - args1.mem_beg);

    // run again
    const result2 = await wrap(simpleAction).with(epsagon)({
      ...DEFAULT_PARAMS,
      EPSAGON_TOKEN: '1234',
    });
    assert.equal(result2, 'ok');
    const args3 = eventStub.getCall(2).args[1];
    assert.ok(args3.mem_beg);
    assert.equal(args3.container.uuid, args1.container.uuid);
    assert.ok(args3.container.age);
    assert.equal(args3.container.concurrency, 1);
    assert.equal(args3.container.numInvocations, 2);
  });

  it('action status does not report stat with no espagon', async () => {
    currentRunner = null;
    const result = await wrap(simpleAction).with(epsagon)({
      ...DEFAULT_PARAMS,
      EPSAGON_TOKEN: '1234',
    });
    assert.equal(result, 'ok');

    assert.equal(eventStub.getCalls().length, 0);
  });
});
