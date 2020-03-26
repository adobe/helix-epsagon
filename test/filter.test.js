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
const crypto = require('crypto');
const assert = require('assert');
const nock = require('nock');
const rp = require('request-promise-native');
const { wrap } = require('@adobe/openwhisk-action-utils');
const { epsagon } = require('../src/index.js');

const simpleAction = async () => {
  // issue a request with authorization
  await rp({
    uri: 'http://localhost:1234/test',
    headers: {
      AuthoRization: 'foobar',
      other: 'test',
    },
  });
  // issue a post request to okta.com
  await rp({
    uri: 'https://foo.okta.com',
    method: 'post',
    body: 'secret',
  });
  return 'ok';
};

describe('Filter Tests', () => {
  it('filters out secrets from action params', async () => {
    Object.assign(process.env, {
      __OW_ACTION_NAME: '/helix/helix-epsagon@1.0.2',
      __OW_ACTION_VERSION: '0.0.3',
      __OW_ACTIVATION_ID: crypto.randomBytes(16).toString('hex'),
      __OW_API_HOST: 'https://runtime.adobe.io',
      __OW_NAMESPACE: 'helix-testing',
      __OW_TRANSACTION_ID: crypto.randomBytes(16).toString('hex'),
    });

    let traces = null;
    const scope0 = nock('http://localhost:1234')
      .post('/')
      .reply((uri, body) => {
        traces = body.events;
        return [200];
      })
      .get('/test')
      .reply(200, 'foo');
    const scope1 = nock(/okta\.com/)
      .post('/')
      .reply(200, 'ok');

    const result = await wrap(simpleAction).with(epsagon, {
      traceCollectorURL: 'http://localhost:1234/',
    })({
      SUPER_SECRET: 'abc',
      someParam: 'foo',

      __ow_headers: {
        'x-request-id': crypto.randomBytes(16).toString('hex'),
      },
      __ow_method: 'get',
      __ow_path: '',
      EPSAGON_TOKEN: '1234',
    });
    assert.equal(result, 'ok');
    await scope0.done();
    await scope1.done();

    // console.log(traces[2]);
    assert.equal(traces.length, 3);
    // the first trace is from the action. check that the params are filtered
    assert.deepEqual(traces[0].resource.metadata.params, {
      someParam: 'foo',
    });
    // the 2nd trace is the http request. check that the authorization header is filtered
    const headers = traces[1].resource.metadata.request_headers;
    delete headers['epsagon-trace-id'];
    assert.deepEqual(headers, {
      host: 'localhost:1234',
      other: 'test',
    });
    // the 3rd trace is the post to okta. ensure that the request_body is empty.
    assert.equal(traces[2].resource.metadata.request_body, undefined);
  });
});
