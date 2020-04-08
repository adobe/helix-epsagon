# Helix Epsagon Support

> Helper library to easily enable epsagon support for openwhisk actions.

## Status
[![codecov](https://img.shields.io/codecov/c/github/adobe/helix-epsagon.svg)](https://codecov.io/gh/adobe/helix-epsagon)
[![CircleCI](https://img.shields.io/circleci/project/github/adobe/helix-epsagon.svg)](https://circleci.com/gh/adobe/helix-epsagon)
[![GitHub license](https://img.shields.io/github/license/adobe/helix-epsagon.svg)](https://github.com/adobe/helix-epsagon/blob/master/LICENSE.txt)
[![GitHub issues](https://img.shields.io/github/issues/adobe/helix-epsagon.svg)](https://github.com/adobe/helix-epsagon/issues)
[![LGTM Code Quality Grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/adobe/helix-epsagon.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/adobe/helix-epsagon)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

# API Reference
<a name="module_epsagon"></a>

## epsagon ⇒ <code>ActionFunction</code>
Wrap function that returns an OpenWhisk function is automatically instrumented with epsagon,
if the `EPSAGON_TOKEN` action parameter is present.

**Usage:**

```js
const { wrap } = require('@adobe/openwhisk-action-utils');
const { epsagon } = require('@adobe/helix-epsagon');

async function main(params) {
  //…my action code…
}

module.exports.main = wrap(main)
  .with(epsagon);
```

**Returns**: <code>ActionFunction</code> - a new function with the same signature as your original main function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| action | <code>ActionFunction</code> |  | Original OpenWhisk action main function |
| [opts] | <code>EpsagonOptions</code> |  | Additional epsagon options |
| [opts.sendTimeout] | <code>number</code> | <code>2000</code> | Time in milliseconds after which the request to the epsagon infrastructure times out. |
| [opts.token_param] | <code>string</code> | <code>&quot;EPSAGON_TOKEN&quot;</code> | The name of the action parameter that contains the epsagon token. |
| [opts.appName] | <code>string</code> | <code>&quot;Helix Service&quot;</code> | The name of _this_ application. |
| [opts.ignoredKeys] | <code>Array.&lt;RegExp, string&gt;</code> | <code>[/^[A-Z][A-Z0-9_]+$/, /^__ow_.*\/, &#x27;authorization&#x27;, &#x27;request_body&#x27;]</code> | Array of patterns for parameter keys to ignore in traces. |
| [opts.urlPatternsToIgnore] | <code>Array.&lt;RegExp, string&gt;</code> | <code>[&#x27;api.coralogix.com&#x27;]</code> | Array of patterns for urls to ignore in traces. |
| [opts.disableHttpResponseBodyCapture] | <code>boolean</code> | <code>true</code> | Disables response capture. |

