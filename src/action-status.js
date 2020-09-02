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
const fs = require('fs');
const crypto = require('crypto');
const { tracer, eventInterface } = require('epsagon');

let numInvocations = 0;
const startTime = Date.now();
const uuid = crypto.randomBytes(16).toString('hex');
const runningActivations = new Set();

/**
 * Returns the number of open file handles. currently not needed anymore but can be enabled if
 * desired.
 * @param {Logger} log the logger.
 * @returns {Promise<number>} The number of open file handles.
 */
/* istanbul ignore next */
// eslint-disable-next-line no-unused-vars
async function getNumOpenFileHandles(log) {
  return new Promise((resolve) => {
    fs.readdir('/proc/self/fd', (err, list) => {
      if (err) {
        log.info(`unable to read /proc/self/fd: ${err.message}`);
        resolve(-1);
      } else {
        resolve(list.length);
      }
    });
  });
}

/**
 * Returns the RSS memory usage.
 * @param {Logger} log Logger.
 * @returns {number} the memory usage or -1 if an error occurs.
 */
function getRssMemory(log) {
  try {
    return process.memoryUsage().rss;
  } catch (e) /* istanbul ignore next */ {
    log.error('error while retrieving memory', e);
    return -1;
  }
}

/**
 * Add a metadata to the runner of the current trace.
 */
function addToMetadata(log, map) {
  try {
    const tracerObj = tracer.getTrace();
    if (!tracerObj || !tracerObj.currRunner) {
      log.debug('Failed to log data without an active tracer');
      return;
    }
    eventInterface.addToMetadata(tracerObj.currRunner, map);
  } catch {
    // ignore
  }
}

/**
 * Wraps the given `action` with functionality to log additional memory and concurrency information.
 * If epsagon is enabled, it will also add the respective metadata to the current epsagon tracer.
 *
 * @param {ActionFunction} action
 *        Original OpenWhisk action main function
 * @returns {ActionFunction} a new function with the same signature as your original main function
 */
function traceActionStatus(action) {
  return async (params) => {
    const { __ow_logger: log = console } = params;

    // if logger doesn't have the `infoFields` method, create polyfill
    if (!log.infoFields) {
      log.infoFields = (msg, obj) => {
        log.info(`${msg} ${JSON.stringify(obj)}`);
      };
    }

    numInvocations += 1;
    // eslint-disable-next-line no-underscore-dangle
    const activationId = process.env.__OW_ACTIVATION_ID;
    runningActivations.add(activationId);

    const begin = {
      mem: getRssMemory(log),
      age: Date.now() - startTime,
      concurrency: runningActivations.size,
    };

    log.infoFields('action-status-begin', {
      container: {
        uuid,
        numInvocations,
        begin,
      },
    });
    try {
      addToMetadata(log, {
        container: {
          uuid,
          numInvocations,
          begin,
        },
      });
      return await action(params);
    } finally {
      const concurrency = runningActivations.size;
      runningActivations.delete(activationId);
      const end = {
        mem: getRssMemory(log),
        age: Date.now() - startTime,
        concurrency,
      };
      const delta = {
        mem: end.mem - begin.mem,
        age: end.age - begin.age,
      };
      log.infoFields('action-status-end', {
        container: {
          uuid,
          numInvocations,
          begin,
          end,
          delta,
        },
      });
      addToMetadata(log, {
        container: {
          uuid,
          numInvocations,
          begin,
          end,
          delta,
        },
      });
    }
  };
}

module.exports = traceActionStatus;
