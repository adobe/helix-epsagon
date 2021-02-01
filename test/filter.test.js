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
const fetchAPI = require('@adobe/helix-fetch');
const { wrap } = require('@adobe/openwhisk-action-utils');
const { epsagon } = require('../src/index.js');

const simpleAction = async () => {
  // create own context and disable http2
  const context = fetchAPI.context({ alpnProtocols: [fetchAPI.ALPN_HTTP1_1] });
  const { fetch } = context;

  // issue a request with authorization
  let response = await fetch('http://example.com/test', {
    headers: {
      AuthoRization: 'foobar',
      other: 'test',
    },
  });

  if (!response.ok) {
    throw new Error(`${response.status} - "${await response.text()}"`);
  }
  await response.buffer();

  // issue a post request to okta.com
  response = await fetch('https://foo.okta.com', {
    method: 'POST',
    body: 'secret',
  });

  if (!response.ok) {
    throw new Error(`${response.status} - "${await response.text()}"`);
  }
  await response.buffer();

  await context.reset();
  return {
    body: 'ok',
  };
};

describe('Filter Tests', () => {
  it('filters out secrets from action params', async () => {
    const actId = crypto.randomBytes(16).toString('hex');
    Object.assign(process.env, {
      __OW_ACTION_NAME: '/helix/helix-epsagon@1.0.2',
      __OW_ACTION_VERSION: '0.0.3',
      __OW_ACTIVATION_ID: actId,
      __OW_API_HOST: 'https://runtime.adobe.io',
      __OW_NAMESPACE: 'helix-testing',
      __OW_TRANSACTION_ID: crypto.randomBytes(16).toString('hex'),
    });

    let traces = null;
    const scope0 = nock('http://example.com')
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
      traceCollectorURL: 'http://example.com/',
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
    assert.deepEqual(result, {
      body: 'ok',
      headers: {
        'x-last-activation-id': actId,
      },
    });
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
      accept: '*/*',
      'accept-encoding': 'gzip,deflate,br',
      host: 'example.com',
      other: 'test',
      'user-agent': 'helix-fetch/2.1.0',
    });
    // the 3rd trace is the post to okta. ensure that the request_body is empty.
    assert.equal(traces[2].resource.metadata.request_body, undefined);
  });
});
