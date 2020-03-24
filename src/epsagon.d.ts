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
/**
 * The `main` function of an OpenWhisk action.
 * @param {object} params the parameters of the action function
 * @returns {object} a result
 */
declare type ActionFunction = (params: object) => object;

/**
 * Options for the epsagon wrap function
 */
export declare interface EpsagonOptions {
  /**
   * Timeout in milliseconds after which the request to the epsagon infrastructure times out.
   * @default 2000
   */
  sendTimeout?: number,

  /**
   * The name of the action parameter that contains the epsagon token.
   * @default 'EPSAGON_TOKEN'
   */
  token_param?: string,

  /**
   * The name of _this_ application
   * @default 'Helix Services'
   */
  appName?: string,

  /**
   * Array of patterns for parameter keys to ignore in traces.
   * @default [/^[A-Z][A-Z0-9_]+$/, /^__ow_.*\/, 'authentication', 'request_body']
   */
  ignoredKeys?: Array<RegExp|string>,

  /**
   * Array of patterns for urls to ignore in traces.
   * @default ['api.coralogix.com']
   */
  urlPatternsToIgnore?: Array<RegExp|string>,
}

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
 * @function logger
 * @param {ActionFunction} fn - original OpenWhisk action main function
 * @param {EpsagonOptions} [opts] - optional options.
 * @returns {ActionFunction} a new function with the same signature as your original main function
 */
export declare function epsagon(fn: ActionFunction, opts: EpsagonOptions): ActionFunction;
