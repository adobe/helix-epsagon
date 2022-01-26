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

/* eslint-disable no-underscore-dangle,max-len */
/**
 * @typedef EpsagonOptions
 * @module epsagon
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
 * @param {Array<RegExp,string>} [opts.ignoredKeys=[/^[A-Z][A-Z0-9_]+$/, /^__ow_.*\/, 'authorization', 'request_body']]
 *        Array of patterns for parameter keys to ignore in traces.
 * @param {string} [opts.ignoredPath='/_status_check/healthcheck.json']
 *        function path that is ignored.
 * @param {Array<RegExp,string>} [opts.urlPatternsToIgnore=['api.coralogix.com']]
 *        Array of patterns for urls to ignore in traces.
 * @param {boolean} [opts.disableHttpResponseBodyCapture=true] Disables response capture.
 *
 * @returns {ActionFunction} a new function with the same signature as your original main function
 */

/**
 * Make default options
 * @param {EpsagonOptions} opts minial options
 * @return {EpsagonOptions} default options
 */
function defaultOptions(opts = {}) {
  return {
    sendTimeout: 2000,
    token_param: 'EPSAGON_TOKEN',
    appName: 'Helix Services',
    metadataOnly: false, // Optional, send more trace data
    ignoredKeys: [/^[A-Z][A-Z0-9_]+$/, /^__ow_.*/, 'authorization', 'request_body'],
    ignoredPath: '/_status_check/healthcheck.json',
    httpErrorStatusCode: 500,
    urlPatternsToIgnore: ['api.coralogix.com'],
    disableHttpResponseBodyCapture: true,
    removeIgnoredKeys: true,
    sendBatch: false,
    ...opts,
  };
}

/**
 * Wraps a lambda handler to enable epsagon tracing if the `options.token` is present.
 * In contrast to openwhisk, the token is present int process.env.
 * @param {function} handler Lambda function to invoke
 * @param {EpsagonOptions} opts Epsagon options
 * @returns {object} response
 */
function lambdaEpsagonWrapper(handler, opts) {
  const options = defaultOptions(opts);
  return async (evt, context) => {
    const suffix = evt.pathParameters?.path ? `/${evt.pathParameters.path}` : '';
    if (suffix !== options.ignoredPath && options?.token_param && process.env[options.token_param]) {
      // ensure that epsagon is only required, if a token is present.
      // This is to avoid invoking their patchers otherwise.
      // eslint-disable-next-line global-require
      const epsagonApi = require('epsagon');
      // eslint-disable-next-line no-console
      console.log('instrumenting epsagon.');
      epsagonApi.init({
        ...options,
        token: process.env[options.token_param],
      });
      return epsagonApi.lambdaWrapper(handler)(evt, context);
    }
    return handler(evt, context);
  };
}

/**
 * Wrap function that returns an OpenWhisk function is automatically instrumented with epsagon,
 * if the `EPSAGON_TOKEN` action parameter is present.
 * @param {function} action OpenWhisk action
 * @param {EpsagonOptions} opts Epsagon options
 * @returns {object} response
 */
function openwhiskEpsagonWrapper(action, opts) {
  const options = defaultOptions(opts);
  return async (params) => {
    if (params && params.__ow_path !== options.ignoredPath && params[options.token_param]) {
      const { __ow_logger: log = console } = params;
      // ensure that epsagon is only required, if a token is present.
      // This is to avoid invoking their patchers otherwise.
      // eslint-disable-next-line global-require
      const { openWhiskWrapper } = require('epsagon');
      log.info('instrumenting epsagon.');

      // same as above - only require if really needed
      // eslint-disable-next-line global-require
      const traceActionStatus = require('./action-status.js');
      const tracedAction = traceActionStatus(action);

      return openWhiskWrapper(tracedAction, options)(params);
    }
    return action(params);
  };
}

module.exports = {
  lambdaEpsagonWrapper,
  openwhiskEpsagonWrapper,
};
