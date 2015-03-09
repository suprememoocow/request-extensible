# request-extensible

A tiny library for added extensions to [Request](https://github.com/request/request).

```
npm install request-extensible
```

# Introduction

Request is a popular HTTP client library for node.js.

Although it has a great deal of built-in functionality, there are times when
you'll need additional features that aren't included by default.


# Usage

Usage is probably best explained with some examples.

## Logging the time taken to make a request

As an extremely simple demo, let's add logging to monitor the time taken for
each request and print it to the console.

```javascript
var requestExt = require('request-extensible');
var request = requestExt({
  extensions: [
    /* Each extension is a function with a signature similar to the
     * request() signature, except that a additional `next` parameter is
     * provided, which needs to be called to invoke the next middleware,
     * or the underlying request call (depending on whether this is the last
     * middleware in the chain)
     */
    function(options, callback, next) {
      var start = Date.now();

      /* Call the next middleware in the chain */
      next(options, function(err, response, body) {
        var duration = Date.now() - start;
        console.log("request: " + options.url + " took " + duration + "ms");

        /* Call `callback` to return to the caller */
        callback(err, response, body);
      });
    }
  ]
});

// Now, use request as normal...
// request({ url: ...}, function(err, response, body) { ... });
```

Each extension has the ability to modify the outgoing request, bypass the
underlying call or modify the incoming response. Even all three in the same
extension.

## Bypassing the underlying HTTP(s) call

In this example, we'll bypass the underlying request if the URL for all
requests made to `http://example.com` and simply return a string response. While
this may not seem to be too useful, it can be used as the basis of an HTTP
caching mechanism.

```javascript
var requestExt = require('request-extensible');
var request = requestExt({
  extensions: [
    function(options, callback, next) {
      if (options.url === 'http://example.com') {
        /* Bypass the underlying call and return immediately with the static
         * response
         */
        return callback(null, { statusCode: 200 }, "This is the body");
      }

      /* Otherwise, simply call the next extension in the chain */
      return next(options, callback);
    }
  ]
});

// Now, use request as normal...
// request({ url: ...}, function(err, response, body) { ... });
```

## Using multiple extensions

Multiple extensions can be added. Extensions are executed from first to last,
with each extension calling the next level down in the chain on `next`.

```javascript
var requestExt = require('request-extensible');
var request = requestExt({
  extensions: [
    function(options, callback, next) {
      /* Add a user-agent header */
      if (!options.headers) options.headers = { };
      options.headers['user-agent'] = 'request-extensible-demo/1.0';

      return next(options, callback);
    },
    function(options, callback, next) {
      /* Count the number of requests */
      /* Each of these requests will have the user-agent header set */
      count++;
      return next(options, callback);
    },
    function(options, callback, next) {
      /* Log all errors to the console */
      next(options, function(err, response, body) {
        if (err) {
          console.error('request: error: ', options.url, err);
        } else if (response.statusCode >= 500) {
          console.error('request: http-error: ', options.url, response.statusCode);
        }

        /* Return control up the chain */
        callback(err, response, body);
      })
    }
  ]
});

// Now, use request as normal...
// request({ url: ...}, function(err, response, body) { ... });
```


Note, additionally that each extension can invoke the `next` method multiple
times, so multiple HTTP requests can be made and spliced together according to
the needs of the application. Note that `callback` should only ever be called
once.

## Other uses

Other extensions could include, but are not limited to:

* Automatically fetching multiple pages of responses and returning all the pages as a single response.
* Adding authentication information
* HTTP caching using ETags and Conditional Requests.
* Monitoring rate-limiting headers
* Statistics

And more!


# Available Extensions

Write your own and publish them as npm modules.

Currently, only a few are available:

| Module               | Description |
|----------------------|---|
| [https://github.com/gitterHQ/request-http-cache](https://github.com/gitterHQ/request-http-cache) | In memory or Redis-based HTTP response caching using ETags and HTTP Conditional Requests. Currently this module is **specifically** designed around making calls to the GitHub API and has not yet been tested or extended for general use.  |


# Licence

License
The MIT License (MIT)

Copyright (c) 2015, Andrew Newdigate

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
