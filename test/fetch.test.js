/*
 * Copyright 2020 Adobe. All rights reserved.
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
const fetchAPI = require('@adobe/helix-fetch');

async function testFetch() {
  // create own context and disable http2
  const context = fetchAPI.context({
    httpProtocol: 'http1',
    httpsProtocols: ['http1'],
  });
  try {
    const resp = await context.fetch('https://raw.githubusercontent.com/adobe/helix-shared/master/package.json');
    const text = await resp.text();
    return {
      statusCode: 200,
      body: text,
    };
  } finally {
    await context.disconnectAll();
  }
}

async function run(params) {
  // process.env.EPSAGON_DEBUG = 'TRUE';
  // eslint-disable-next-line global-require
  const { openWhiskWrapper } = require('epsagon');
  // eslint-disable-next-line no-console
  console.log('instrumenting epsagon.');
  const action = openWhiskWrapper(testFetch, {
    sendTimeout: 2000,
    ignoredKeys: [/^[A-Z][A-Z0-9_]+$/, /^__ow_.*/],
    httpErrorStatusCode: 500,
    urlPatternsToIgnore: ['api.coralogix.com'],
    token_param: 'EPSAGON_TOKEN',
    appName: 'Helix Testing',
    metadataOnly: false,
  });
  return action(params);
}

describe('Helix Fetch', () => {
  it('Runs action with helix fetch.', async () => {
    Object.assign(process.env, {
      __OW_ACTION_NAME: '/tripod/epsagon-testing@1.0.2',
      __OW_ACTION_VERSION: '0.0.3',
      __OW_ACTIVATION_ID: crypto.randomBytes(16).toString('hex'),
      __OW_API_HOST: 'https://runtime.adobe.io',
      __OW_NAMESPACE: 'tripod',
      __OW_TRANSACTION_ID: crypto.randomBytes(16).toString('hex'),
    });

    const res = await run({
      EPSAGON_TOKEN: 'dummy',
      __ow_headers: {
        'x-request-id': crypto.randomBytes(16).toString('hex'),
      },
      __ow_method: 'get',
      __ow_path: '',
    });

    assert.equal(res.statusCode, 200);
  });
});
