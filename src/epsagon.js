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
/* eslint-disable no-underscore-dangle */

/**
 * Wrap function that returns an OpenWhisk function is automatically instrumented with epsagon,
 * if the `EPSAGON_TOKEN` action parameter is present.
 *
 * **Usage:**
 *
 * ```js
 * const { wrap } = require('@adobe/openwhisk-action-utils');
 * const { epsagon } = require('@adobe/helix-epsagon');
 *
 * async function main(params) {
 *   //…my action code…
 * }
 *
 * module.exports.main = wrap(main)
 *   .with(epsagon);
 * ```
 *
 * @module epsagon
 *
 * @param {ActionFunction} action
 *        Original OpenWhisk action main function
 * @param {EpsagonOptions} [opts]
 *        Additional epsagon options
 * @param {number} [opts.sendTimeout=2000]
 *        Time in milliseconds after which the request to the epsagon infrastructure times out.
 * @param {string} [opts.token_param=EPSAGON_TOKEN]
 *        The name of the action parameter that contains the epsagon token.
 * @param {string} [opts.appName=Helix Service]
 *        The name of _this_ application.
 * @param {Array<RegExp,string>} [opts.ignoredKeys=[/^[A-Z][A-Z0-9_]+$/, /^__ow_.*\/,
 *        'authentication', 'request_body']]
 *        Array of patterns for parameter keys to ignore in traces.
 * @param {Array<RegExp,string>} [opts.urlPatternsToIgnore=['api.coralogix.com']]
 *        Array of patterns for urls to ignore in traces.
 *
 * @returns {ActionFunction} a new function with the same signature as your original main function
 */
function epsagon(action, opts = {}) {
  const options = {
    sendTimeout: 2000,
    token_param: 'EPSAGON_TOKEN',
    appName: 'Helix Services',
    metadataOnly: false, // Optional, send more trace data
    ignoredKeys: [/^[A-Z][A-Z0-9_]+$/, /^__ow_.*/, 'authentication', 'request_body'],
    httpErrorStatusCode: 500,
    urlPatternsToIgnore: ['api.coralogix.com'],
    ...opts,
  };

  return async (params) => {
    if (params && params[options.token_param]) {
      const { __ow_logger: log = console } = params;
      // ensure that epsagon is only required, if a token is present.
      // This is to avoid invoking their patchers otherwise.
      // eslint-disable-next-line global-require
      const { openWhiskWrapper } = require('epsagon');
      log.info('instrumenting epsagon.');
      return openWhiskWrapper(action, options)(params);
    }
    return action(params);
  };
}


module.exports = epsagon;
