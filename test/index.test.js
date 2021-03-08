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

let epsagonified = 0;

const wrapperStub = sinon.stub().callsFake((action) => (...args) => {
  epsagonified += 1;
  return action(...args);
});

const actionStatusStub = sinon.stub().callsFake((action) => (...args) => action(...args));

const epsagonInitStub = sinon.stub().callsFake(() => {});

const epsagon = proxyquire('../src/epsagon.js', {
  epsagon: {
    openWhiskWrapper: wrapperStub,
    lambdaWrapper: wrapperStub,
    init: epsagonInitStub,
  },
  './action-status.js': actionStatusStub,
});

describe('Index Tests', () => {
  let activationId;
  beforeEach(() => {
    wrapperStub.resetHistory();
    actionStatusStub.resetHistory();
    epsagonInitStub.resetHistory();
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
    delete process.env.AWS_LAMBDA_FUNCTION_NAME;
  });

  it('action w/o token does not instrument epsagon', async () => {
    const expected = epsagonified;
    const result = await wrap(simpleAction).with(epsagon)(DEFAULT_PARAMS);
    assert.equal('ok', result);
    assert.equal(expected, epsagonified, 'epsagon not instrumented');
  });

  it('adds x-last-activation-token for web-actions', async () => {
    const expected = epsagonified;
    const result = await wrap(() => ({ body: 'ok' })).with(epsagon)({
      ...DEFAULT_PARAMS,
      __ow_method: 'get',
    });
    assert.deepEqual(result, {
      body: 'ok',
      headers: {
        'x-last-activation-id': activationId,
      },
    });
    assert.equal(expected, epsagonified, 'epsagon not instrumented');
  });

  it('adds x-last-activation-token for async web-actions', async () => {
    const expected = epsagonified;
    const result = await wrap(async () => ({ body: 'ok' })).with(epsagon)({
      ...DEFAULT_PARAMS,
      __ow_method: 'get',
    });
    assert.deepEqual(result, {
      body: 'ok',
      headers: {
        'x-last-activation-id': activationId,
      },
    });
    assert.equal(expected, epsagonified, 'epsagon not instrumented');
  });

  it('adds x-last-activation-token for web-actions with header', async () => {
    const expected = epsagonified;
    const result = await wrap(() => ({ body: 'ok', headers: {} })).with(epsagon)({
      ...DEFAULT_PARAMS,
      __ow_method: 'get',
    });
    assert.deepEqual(result, {
      body: 'ok',
      headers: {
        'x-last-activation-id': activationId,
      },
    });
    assert.equal(expected, epsagonified, 'epsagon not instrumented');
  });

  it('action with token instruments epsagon', async () => {
    const expected = epsagonified + 1;
    const result = await wrap(simpleAction).with(epsagon)({
      ...DEFAULT_PARAMS,
      EPSAGON_TOKEN: '1234',
    });
    assert.equal(result, 'ok');
    assert.equal(epsagonified, expected, 'epsagon instrumented');

    // check called with default args
    const statusCall = actionStatusStub.getCall(0);
    assert.strictEqual(statusCall.args[0], simpleAction);
    const call = wrapperStub.getCall(0);
    assert.deepEqual(call.args[1], {
      appName: 'Helix Services',
      ignoredKeys: [/^[A-Z][A-Z0-9_]+$/, /^__ow_.*/, 'authorization', 'request_body'],
      metadataOnly: false,
      sendTimeout: 2000,
      token_param: 'EPSAGON_TOKEN',
      httpErrorStatusCode: 500,
      removeIgnoredKeys: true,
      sendBatch: false,
      urlPatternsToIgnore: [
        'api.coralogix.com',
      ],
      disableHttpResponseBodyCapture: true,
    });
  });

  it('function with token instruments epsagon', async () => {
    process.env.AWS_LAMBDA_FUNCTION_NAME = 'foo-bar';
    const expected = epsagonified + 1;
    const result = await wrap(simpleAction).with(epsagon, { token: 'foo-bar' })({
      ...DEFAULT_PARAMS,
    });
    assert.equal(result, 'ok');
    assert.equal(epsagonified, expected, 'epsagon instrumented');

    // check called with default args
    const call = epsagonInitStub.getCall(0);
    assert.deepEqual(call.args[0], {
      appName: 'Helix Services',
      ignoredKeys: [/^[A-Z][A-Z0-9_]+$/, /^__ow_.*/, 'authorization', 'request_body'],
      metadataOnly: false,
      sendTimeout: 2000,
      token_param: 'EPSAGON_TOKEN',
      httpErrorStatusCode: 500,
      removeIgnoredKeys: true,
      sendBatch: false,
      urlPatternsToIgnore: [
        'api.coralogix.com',
      ],
      disableHttpResponseBodyCapture: true,
      token: 'foo-bar',
    });
  });

  it('function w/o token does not instrument epsagon', async () => {
    process.env.AWS_LAMBDA_FUNCTION_NAME = 'foo-bar';
    const expected = epsagonified;
    const result = await wrap(simpleAction).with(epsagon)(DEFAULT_PARAMS);
    assert.equal('ok', result);
    assert.equal(expected, epsagonified, 'epsagon not instrumented');
  });

  it('can change epsagon options', async () => {
    const expected = epsagonified + 1;
    const result = await wrap(simpleAction).with(epsagon, {
      appName: 'test service',
      ignoredKeys: [],
      metadataOnly: true,
      sendTimeout: 3000,
      token_param: 'MY_TOKEN',
      urlPatternsToIgnore: [
        'api.logger.com',
      ],
    })({
      ...DEFAULT_PARAMS,
      MY_TOKEN: '1234',
    });
    assert.equal(result, 'ok');
    assert.equal(epsagonified, expected, 'epsagon instrumented');

    // check called with default args
    const statusCall = actionStatusStub.getCall(0);
    assert.strictEqual(statusCall.args[0], simpleAction);
    const call = wrapperStub.getCall(0);
    assert.deepEqual(call.args[1], {
      appName: 'test service',
      ignoredKeys: [],
      metadataOnly: true,
      sendTimeout: 3000,
      token_param: 'MY_TOKEN',
      httpErrorStatusCode: 500,
      removeIgnoredKeys: true,
      sendBatch: false,
      urlPatternsToIgnore: [
        'api.logger.com',
      ],
      disableHttpResponseBodyCapture: true,
    });
  });

  it('can use different token param', async () => {
    const expected = epsagonified + 1;
    const result = await wrap(simpleAction).with(epsagon, {
      token_param: 'MY_TOKEN',
    })({
      ...DEFAULT_PARAMS,
      MY_TOKEN: '1234',
    });
    assert.equal(result, 'ok');
    assert.equal(epsagonified, expected, 'epsagon instrumented');
  });

  it('index function runs epsagon once for each invocation', async () => {
    const main = wrap(simpleAction).with(epsagon);

    const expected = epsagonified + 2;

    await main({
      ...DEFAULT_PARAMS,
      EPSAGON_TOKEN: 'foobar',
    });
    await main({
      ...DEFAULT_PARAMS,
      EPSAGON_TOKEN: 'foobar',
    });
    assert.equal(epsagonified, expected, 'epsagon instrumented');
  });
});
