# A simple HTTP Proxy that replaces response body with local file

## How To Use

Copy `example.config.js` to `config.js`, and run `proxy.js` with [node.js](https://nodejs.org/).

```
$ node proxy.js
05:43:40 Proxy server running at 127.0.0.1:8084
```

Then configure your browser to use `127.0.0.1:8084` as proxy server.

### How To Replace Files

Add a pattern in URI, and local filename to `files` in `config.js`.

`exmaple.config.js` contains the following example, that replaces the response
body of the requesut which URI contains `some_minified_code.js` with
local file `files/prettified_and_modified_code.js`.

```
  files: [
    // pattern in URI         local filename
    ["some_minified_code.js", "files/prettified_and_modified_code.js"],
  ],
```

After modified `config.js`, restart `proxy.js` to reflect the change.

# See Also

This script is based on [jsproxy.js](https://gist.github.com/wscanf/4167276) (fangyong 2012-11-29 wscanf@126.com)
