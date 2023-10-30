---
title: NodeJs
date: "2023-09-12"
category: Tech
tag: "node.js"
description: "Nodejs learning record."
---

[[toc]]

## Asynchronous context tracking

### AsyncLocalStorage

#### Use Context

When you are using asynchronous operations during the execution process， and need
pass some context.

#### Examples

```tsx
import http from "node:http";
import { AsyncLocalStorage } from "node:async_hooks";

const asyncLocalStorage = new AsyncLocalStorage();

function logWithId(msg) {
  /**
   * will always get the id implicitly stored by `asyncLocalStorage.run`
   */
  const id = asyncLocalStorage.getStore();
  console.log(`${id !== undefined ? id : "-"}:`, msg);
}

let idSeq = 0;
http
  .createServer((req, res) => {
    asyncLocalStorage.run(idSeq++, () => {
      logWithId("start");
      // Imagine any chain of async operations here
      setTimeout(() => {
        logWithId("finish");
        res.end();
      }, (2 - idSeq) * 1000);
    });
  })
  .listen(8000);

http.get("http://localhost:8000");
http.get("http://localhost:8000");
// Prints:
// 0: start
// 1: start
// 1: finish
// 0: finish
```

#### Real World Case(Koa)

##### Implementation

```js
class Application {
  listen(...args) {
    debug("listen");
    const server = http.createServer(this.callback());
    return server.listen(...args);
  }

  callback() {
    const fn = this.compose(this.middleware);
    if (!this.listenerCount("error")) this.on("error", this.onerror);

    return (req, res) => {
      const ctx = this.createContext(req, res);
      return this.ctxStorage.run(ctx, async () => {
        return this.handleRequest(ctx, fn);
      });
    };
  }

  /* export ctx in app currentContext prop*/
  get currentContext() {
    if (this.ctxStorage) return this.ctxStorage.getStore();
  }
}
```

##### Usage

```tsx
const app = new Koa({ asyncLocalStorage: true });

app.use(async (ctx) => {
  assert(ctx === app.currentContext);
  await new Promise((resolve) => {
    setTimeout(() => {
      assert(ctx === app.currentContext);
      resolve();
    }, 1);
  });
  await new Promise((resolve) => {
    assert(ctx === app.currentContext);
    setImmediate(() => {
      assert(ctx === app.currentContext);
      resolve();
    });
  });
  assert(ctx === app.currentContext);
  app.currentContext.body = "ok";
});
```

### AsyncResource

#### Use Context

manage the lifecycle of asynchronous resources.

## Buffer

### UseContext

Tools used to handle binary data.

### Examples

```ts
const http = require("http");
const fs = require("fs");

const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/upload") {
    let data = [];

    req.on("data", (chunk) => {
      data.push(chunk);
    });

    req.on("end", () => {
      const buffer = Buffer.concat(data);

      fs.writeFile("uploaded-image.jpg", buffer, (err) => {
        if (err) {
          res.writeHead(500);
          res.end("Server error");
          return;
        }
        const base64Image = buffer.toString("base64");

        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end(base64Image);
      });
    });
  } else {
    res.writeHead(404);
    res.end("Not Found");
  }
});

server.listen(3000, () => {
  console.log("Server is running at http://localhost:3000");
});
```

## C++ Addon

### Set up

Install package `node-addon-api bindings` to use `#include <napi.h>`, `node-gyp`
to compile.

```shell
pnpm i node-addon-api bindings @types/bindings node-gyp
```

Clone nodejs source code

```shell
git clone --depth 1 https://github.com/nodejs/node.git
```

Set up head file in `.vscode/c_cpp_properties.json`(for vscode c++ extension)

```json
{
  "configurations": [
    {
      "name": "Mac",
      "includePath": [
        "${workspaceFolder}/**",
        "/Users/lianwenwu/work/github/node/deps/v8/include",
        "/Users/lianwenwu/work/github/node/src",
        "node_modules/node-addon-api/"
      ],
      "defines": [],
      "macFrameworkPath": [
        "/Library/Developer/CommandLineTools/SDKs/MacOSX.sdk/System/Library/Frameworks"
      ],
      "compilerPath": "/usr/bin/clang",
      "cStandard": "c17",
      "cppStandard": "c++17",
      "intelliSenseMode": "macos-clang-arm64"
    }
  ],
  "version": 4
}
```

Create `binding.gyp`

```python
{
    "targets": [
        {
            "target_name": "hello",
            "sources": ["hello_world.cc"],
            'include_dirs': ["<!(node -p \"require('node-addon-api').include_dir\")"],
            'cflags!': ['-fno-exceptions'],
            'cflags_cc!': ['-fno-exceptions'],
            'conditions': [
                ["OS=='win'", {
                    "defines": [
                        "_HAS_EXCEPTIONS=1"
                    ],
                    "msvs_settings": {
                        "VCCLCompilerTool": {
                            "ExceptionHandling": 1
                        },
                    },
                }],
                ["OS=='mac'", {
                    'xcode_settings': {
                        'GCC_ENABLE_CPP_EXCEPTIONS': 'YES',
                        'CLANG_CXX_LIBRARY': 'libc++',
                        'MACOSX_DEPLOYMENT_TARGET': '10.7',
                    },
                }],
            ],
        }
    ],
}
```

Create `hello_world.cc`

```cpp
#include <napi.h>

using namespace Napi;
class HelloAddon : public Addon<HelloAddon> {
 public:
  HelloAddon(Env env, Object exports) {
    DefineAddon(exports, {
      InstanceMethod("hello", &HelloAddon::Hello, napi_enumerable)
    });
  }

 private:
  Value Hello(const CallbackInfo& info) {
    return String::New(info.Env(), "world");
  }
};

NODE_API_ADDON(HelloAddon)
```

Create index.mjs

```js
import bindings from "bindings";

const addon = bindings({
  bindings: "hello.node",
  module_root: process.cwd(),
});
console.log(addon.hello());
```

Compile and run

```shell
npx node-gyp configure build
node index.mjs
```

## Child process

### Use Context

Primarily used to execute shell commands and run external programs.

### Exec

```tsx
import { exec } from "child_process";

exec("ls", (err, stdout, stderr) => {
  if (err) {
    console.error(`exec error: ${err}`);
    return;
  }

  console.log(`stdout: ${stdout}`);
  console.error(`stderr: ${stderr}`);
});
```

### Spawn

```tsx
import { spawn } from "child_process";

/**
 * spawn a new process
 */
spawn("ls", {
  stdio: "inherit",
});
```

### Fork

```tsx
// child.ts
process.on("message", (msg) => {
  console.log("Message from parent:", msg);
});

let counter = 0;

setInterval(() => {
  process.send?.({ counter: counter++ });
}, 1000);

// parent.ts
import { fork } from "child_process";

const child = fork("./child");

child.send({ hello: "world" });

child.on("message", (msg) => {
  console.log("Message from child", msg);
});
```

The difference between `spawn` and `fork` is that the latter will create an IPC
channel to communicate with parent process.

### Note

In the real world, we generally use the `cross-spawn` package because the spawn
function in Node.js [does not perform well on Windows](https://github.com/moxystudio/node-cross-spawn#why).

## Cluster

### Use Context

When deploying Node.js to a server, to fully utilize the server's CPU, we generally
use the [PM2](https://github.com/Unitech/pm2) cluster mode for deploying Node.js.

If you want to monitor it, you can use [easy-monitor](https://github.com/hyj1991/easy-monitor).

### Usage

```tsx
import cluster from "cluster";
import http from "http";
import os from "os";

const numCPUs = os.cpus().length;
console.log("cpus", numCPUs);

if (cluster.isPrimary) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs / 2; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  // Workers can share any TCP connection
  // In this case, it is an HTTP server
  http
    .createServer((req, res) => {
      res.writeHead(200);
      res.end("hello world\n");
    })
    .listen(8000);

  console.log(`Worker ${process.pid} started`);
}
```

## Crypto(ˈkrɪptoʊ)

### Use Context

Encryption and decryption, and scenarios related to confidentiality.

`crypto` has built-in `DH` and `ECDH` algorithm modules.

### Password gen

```tsx
import crypto from "crypto";

const password = "myPassword";
const salt = crypto.randomBytes(16).toString("hex");

crypto.pbkdf2(password, salt, 10000, 64, "sha512", (err, derivedKey) => {
  if (err) throw err;
  console.log(derivedKey.toString("hex")); // Prints the hashed password
});
```

### Cipheriv and decipheriv

`Cipher` has two useful method `update()` and `final()`, When using streams,
the `pipe()` method will internally call these two methods.

```tsx
import crypto from "crypto";
import fs from "fs";

const algorithm = "aes-256-cbc";
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

const data = "rqwreqwerqw41234124121";
fs.writeFileSync("source.txt", data, {
  encoding: "utf-8",
});

const cipher = crypto.createCipheriv(algorithm, key, iv);

const input = fs.createReadStream("source.txt", "utf-8");
const output = fs.createWriteStream("encrypted.txt");

input.pipe(cipher).pipe(output);

output.on("finish", () => {
  const decipher = crypto.createDecipheriv(algorithm, key, iv);

  const input1 = fs.createReadStream("encrypted.txt");
  const output1 = fs.createWriteStream("decrypted.txt", "utf-8");

  input1.pipe(decipher).pipe(output1);
});
```

### Create and verify Sign

```tsx
import crypto from "crypto";

const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
});

// Sign
const sign = crypto.createSign("SHA256");
sign.update("some data to sign");
const signature = sign.sign(privateKey, "hex");
console.log(signature);

// Verify
const verify = crypto.createVerify("SHA256");
verify.update("some data to sign");
console.log(verify.verify(publicKey, signature, "hex")); // Prints: true
```

## Diagnostics(ˌdaɪəɡˈnɒstɪks) channel

### Use Context

Logger.

```tsx
import { channel, subscribe } from "diagnostics_channel";

/**
 * export
 **/
const channelName = Symbol("channel");

const c = channel(channelName);

subscribe(channelName, (message) => {
  console.log("Received message:", message);
});

c.publish({
  data: "Hello, world!",
});
```

## Error

### Use Context

Error tracing.

### CaptureStackTrace

Creates a .stack property on targetObject, which when accessed returns a string
representing the location in the code at which Error.captureStackTrace() was called.

```tsx
const fun1 = () => {
  fun2();
};
const fun2 = () => {
  fun3();
};
const fun3 = () => {
  log_stack();
};
function log_stack() {
  let err = {};
  // will not contain info about fun2
  Error.captureStackTrace(err, fun2);
  console.log(err.stack);
}
fun1();
```

### StackTraceLimit

The Error.stackTraceLimit property specifies the number of stack frames collected
by a stack trace (whether generated by new Error().stack or Error.captureStackTrace(obj)).

```tsx
const fun1 = () => {
  fun2();
};
const fun2 = () => {
  fun3();
};
const fun3 = () => {
  log_stack();
};
function log_stack() {
  let err = {};
  Error.stackTraceLimit = 2;
  Error.captureStackTrace(err);

  console.log(err.stack);
}
fun1();
```

## Inspector

### Use Context

Analyzing and detecting the runtime behavior of an application.

### Cpu Profile

```tsx
import { Session } from "node:inspector";
import fs from "node:fs";
import { promisify } from "node:util";

const session = new Session();
session.connect();
const post = promisify(session.post).bind(session);

(async () => {
  await post("Profiler.enable");
  await post("Profiler.start");
  const { profile } = await post("Profiler.stop");

  fs.writeFileSync("./profile.cpuprofile", JSON.stringify(profile));
})();
```

### HeapSnapShot

```tsx
import { Session } from "node:inspector";
import fs from "node:fs";
import { promisify } from "node:util";

const session = new Session();
session.connect();

const fd = fs.openSync("profile.heapsnapshot", "w");

session.on("HeapProfiler.addHeapSnapshotChunk", (m) => {
  fs.writeSync(fd, m.params.chunk);
});

const post = promisify(session.post).bind(session);

(async () => {
  await post("HeapProfiler.takeHeapSnapshot");
  session.disconnect();
  fs.closeSync(fd);
})();
```

> How to analyze `.heapsnapshot` file? We can use chrome devtools memory tab to
> load it.

#### HeapSnapShot Format References

1. [https://zhengrenzhe.dev/posts/v8-snapshot/](https://zhengrenzhe.dev/posts/v8-snapshot/)
2. [https://learn.microsoft.com/zh-cn/microsoft-edge/devtools-guide-chromium/memory-problems/heap-snapshot-schema](https://learn.microsoft.com/zh-cn/microsoft-edge/devtools-guide-chromium/memory-problems/heap-snapshot-schema)
3. [https://juejin.cn/post/6940439962722500616](https://juejin.cn/post/6940439962722500616)
4. [https://github.com/childrentime/heapquery-js](https://juejin.cn/post/6940439962722500616)
5. [https://chromedevtools.github.io/devtools-protocol/v8/Profiler/](https://chromedevtools.github.io/devtools-protocol/v8/Profiler/)

## Modules

### Commonjs

#### Interoperability

In CommonJS modules, it is not possible to import ES modules except `dynamic import`.

```tsx
// when using import expression, will always treated cjs as es module
await import("cjs");
```

#### Caching

Modules are cached after the first time they are loaded. Calling `require('./foo')`
multiple times will only execs once. We can use `delete require.cache[filePath]`
combine `require('./filepath')` to hot reloading module. A npm packages
[clear-module](https://www.npmjs.com/package/clear-module) is doing this.

#### The module wrapper

Before a module's code is executed, Node.js will wrap it with a function wrapper
that looks like the following:

```tsx
(function (exports, require, module, __filename, __dirname) {
  // Module code actually lives in here
});
```

##### exports

A shortcut be equivalent to `module.exports`.

##### require

1. `require.main` The Module object representing the entry script loaded when the
   Node.js process launched.

2. `require.resolve` Use the internal require() machinery to look up the location
   of a module, but rather than loading the module, just return the resolved filename.
   When writing CLI tools, we usually use `require.resolve` to ensure that we only
   import packages from our own project.

#### The `module` object

In each module, the module free variable is a reference to the object representing the current module. For convenience, module.exports is also accessible via the exports module-global. module is not actually a global but rather local to each module.

### ECMAScript modules

ECMAScript Modules uses asynchronous imports, support top-level `await`. When using `import` to import modules,
it is necessary to include the file extension. We usually use TypeScript,
so it is rare to see such statements.

#### Interoperability

```tsx
import { default as cjs } from "cjs"; // equal to module.exports object
import cjsSugar from "cjs"; // sugar syntax above
import * as m from "cjs"; // equal to module object
console.log(m);
console.log(m === (await import("cjs"))); // dynamic import equal to module object
import { name } from "cjs"; // equal to module.exports.name
```

#### Caching

ES modules have their own independent module cache. Currently,
[Node.js does not lock ability of hot module replacement for ESM modules](https://github.com/nodejs/loaders/issues/22).

#### Scope Equivalent

1. `import.meta.url`: The absolute file: URL of the module.
2. `import.meta.resolve`: a module-relative resolution function scoped to each module, returning the URL string

```tsx
import { fileURLToPath } from "url";
import { dirname } from "path";
import { createRequire } from "node:module";

// equal to require.resolve
const dependencyAsset = import.meta.resolve("component-lib");
const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
```

#### Custom Import

[See Hooks](https://nodejs.org/docs/latest-v20.x/api/module.html#import-from-https)

## Net

### Use Context

The node:net module provides an asynchronous network API for creating stream-based TCP or IPC servers (`net.createServer()`) and clients (`net.createConnection()`).

### Prerequisite(priːˈrekwəzɪt) knowledge

#### IPC

we have several ways to make interprocess communication.

| Method             | OS        |
| ------------------ | --------- |
| Signal             | Most      |
| Unix Domain Socket | Unix Like |
| Message Queue      | Most      |
| Anonymous Pipe     | Most      |
| Named Queue        | Most      |
| Shared Memory      | Most      |

In the abstraction layer implementation of the `net` module, Unix systems have chosen Unix domain sockets, while Windows systems have chosen [named pipes](https://learn.microsoft.com/en-us/windows/win32/ipc/pipe-names) as the communication mechanism.

##### Unix

In Unix, everything is treated as a file, and Unix domain sockets are also based on a `.socket` file for communication.

```tsx
// server-ipc.ts
import net from "net";

const server = net.createServer((socket) => {
  console.log("Client connected.");

  socket.on("data", (data) => {
    console.log("Received:", data.toString());
    socket.write("Server says: Hello!");
  });

  socket.on("end", () => {
    console.log("Client disconnected.");
  });
});

server.listen("/tmp/my-ipc.sock", () => {
  console.log("Server listening on UNIX domain socket:", server.address());
});

// client-ipc.ts
import net from "net";

const client = net.createConnection("/tmp/my-ipc.sock", () => {
  console.log("Connected to server.");

  client.write("Hello, server!");
});

client.on("data", (data) => {
  console.log("Received:", data.toString());
  client.end();
});

client.on("end", () => {
  console.log("Disconnected from server.");
});
```

##### Windows

In Windows, The path must refer to an entry in `\\?\pipe\` or `\\.\pipe\`. Any characters are permitted, but the latter may do some processing of pipe names, such as resolving .. sequences. Despite how it might look, the pipe namespace is flat.

```tsx
net.createServer().listen(path.join("\\\\?\\pipe", process.cwd(), "myctl"));
```

### Tcp Examples

```tsx
// server-tcp.ts
import net from 'net';

const server = net.createServer((socket) => {
  console.log('Client connected');

  socket.on('data', (data) => {
    console.log('Received:', data.toString());
    socket.write('Server says: Hello!');
  });

  socket.on('end', () => {
    console.log('Client disconnected.);
  });
});

server.listen(3000, '127.0.0.1', () => {
  console.log('Server started');
});

// client-tcp.ts
import net from 'net';

const client = net.connect(3000, '127.0.0.1', () => {
  console.log('Connected to server.');

  client.write('Hello, server!');
});

client.on('data', (data) => {
  console.log('Received:', data.toString());
  client.end();
});

client.on('end', () => {
  console.log('Disconnected from server.');
});
```

## Performance Hooks

### Prerequisite(priːˈrekwəzɪt) knowledge

[Web Perfomance APIS](https://w3c.github.io/perf-timing-primer/)

#### Resource Timing

Web Applications mostly consist of a set of downloadable resources. Here resources usually refer to HTML documents, XHR objects, links (such as a stylesheet) or SVG elements.

![Resource Timing](/resource-timing.png)

#### Performance Timeline

The Performance Timeline API uses PerformanceEntry.entryType to describe the type of the interface represented by this PerformanceEntry object, which represents performance measurements.

![Performance Timeline](/performance-timeline.png)

#### High-Resolution Time

The `performance.now()` method returns a high-resolution time relative to the start of the page load, typically in milliseconds. It provides a monotonic clock for measuring time intervals and performance analysis. A key characteristic of a monotonic clock is that it is not affected by system time adjustments (such as daylight saving time) or manual changes made by the user. This makes it more reliable and accurate for performance measurement and timing.

Negative example: use `Date.now` to measure may not be accurate.

#### User Timing

We can use `performance.mark` and `performance.measure` to measure user timing. The `measure` method returns the time between two marks.

```tsx
import async_hooks from "node:async_hooks";
import { performance, PerformanceObserver } from "node:perf_hooks";

const set = new Set();
const hook = async_hooks.createHook({
  init(id, type) {
    if (type === "Timeout") {
      performance.mark(`Timeout-${id}-Init`);
      set.add(id);
    }
  },
  destroy(id) {
    if (set.has(id)) {
      set.delete(id);
      performance.mark(`Timeout-${id}-Destroy`);
      performance.measure(
        `Timeout-${id}`,
        `Timeout-${id}-Init`,
        `Timeout-${id}-Destroy`
      );
    }
  },
});
hook.enable();

const obs = new PerformanceObserver((list, observer) => {
  console.log(list.getEntries()[0]);
  performance.clearMarks();
  performance.clearMeasures();
  observer.disconnect();
});
obs.observe({ entryTypes: ["measure"], buffered: true });

setTimeout(() => {}, 1000);
```

### PerformanceEntry

In Node.js, there are some environment-specific entry types.

- 'node' (Node.js only)
- 'mark' (available on the Web)
- 'measure' (available on the Web)
- 'gc' (Node.js only)
- 'function' (Node.js only)
- 'http2' (Node.js only)
- 'http' (Node.js only)
- 'dns' (Node.js only)
- 'net' (Node.js only)

```tsx
import { PerformanceObserver } from "node:perf_hooks";
import http from "node:http";

const obs = new PerformanceObserver((items) => {
  items.getEntries().forEach((item) => {
    console.log(item);
  });
});

obs.observe({ entryTypes: ["http"] });

const PORT = 8080;

http
  .createServer((req, res) => {
    res.end("ok");
  })
  .listen(PORT, () => {
    http.get(`http://127.0.0.1:${PORT}`);
  });
```

## Process

### unhandledRejection and rejectionHandled

UnhandledRejection and rejectionHandled are a pair of events used to monitor unhandled and handled promises in a program.

The unhandledRejection event is used to capture unhandled promises. It is triggered when a promise is rejected but not caught by any .catch() or Promise.prototype.catch() handler.

The rejectionHandled event is used to capture handled promises. It is triggered when a previously unhandled promise is caught by adding a .catch() handler.

By listening to these two events, we can track and handle uncaught and caught promises in a program.

The uncaughtException event by default captures general JavaScript exceptions. However, when running Node.js with the --unhandled-rejections=strict flag, it also captures unhandled promise rejections.

```tsx
// try node --unhandled-rejections=strict example.js and ndoe example.js
// example.js
process.on("uncaughtException", (e) => {
  console.error("uncaughtException", e);
});
process.on("unhandledRejection", (e) => {
  console.info("unhandledRejection:", e);
});
process.on("rejectionHandled", (e) => {
  console.info("rejectionHandled", e);
});

// emit unhandledRejection
var p = new Promise(function (resolve, reject) {
  reject("rejected");
});

setImmediate(function () {
  // emit rejectionHandled in next macrotask
  p.catch(function (reason) {
    console.info("promise catch:", reason);
  });
});
```

### argv

The process.argv property returns an array containing the command-line arguments passed when the Node.js process was launched.

```tsx
// node example.mjs one two=three four
import { argv } from "node:process";

argv.forEach((val, index) => {
  console.log(`${index}: ${val}`);
});
```

### argv0

The first element of argv will be `process.execPath`. See process.argv0 if access to the original value of argv[0] is needed

```bash
bash -c 'exec -a customArgv0 node'
process.argv[0]
process.argv0
```

### nextTick

The `queueMicrotask()` API is an alternative to process.nextTick() that also defers execution of a function using the same microtask queue used to execute the then, catch, and finally handlers of resolved promises. Within Node.js, every time the "next tick queue" is drained, the microtask queue is drained immediately after.

[Difference between cjs and esm](https://github.com/nodejs/node/issues/47319#issuecomment-1490468318)

```tsx
import { nextTick } from "node:process";

nextTick(() => console.log(1));
Promise.resolve().then(() => console.log(2));
queueMicrotask(() => console.log(3));
```

## Stream

### Object mode

All streams created by Node.js APIs operate exclusively on strings and Buffer (or Uint8Array) objects. It is possible, however, for stream implementations to work with other types of JavaScript values (with the exception of null, which serves a special purpose within streams). Such streams are considered to operate in "object mode".

Stream instances are switched into object mode using the objectMode option when the stream is created. Attempting to switch an existing stream into object mode is not safe.

### Buffering

For a Writable Stream, the value of `highWaterMark` determines when the stream's flow control mechanism is triggered. When the amount of data being written exceeds `highWaterMark`, the writable stream pauses receiving data until the data in its internal buffer decreases to below the low watermark, and then it resumes receiving data.

For a Readable Stream, the value of highWaterMark determines when the stream starts generating read operations. When the amount of data in the internal buffer of the readable stream reaches `highWaterMark`, the readable stream stops reading data from the underlying resource (such as a file or network) until the consumer reads the data from the buffer, causing the data in the buffer to decrease below the low watermark.

In object mode, the meaning of highWaterMark is slightly different. It is no longer measured in bytes but represents the number of objects the stream can hold. This is because in object mode, the stream transmits JavaScript objects instead of raw byte data.

### WriteableStream

#### Drain

If a call to `stream.write(chunk)` returns false(when buffer size is at `highWaterMark`), the 'drain' event will be emitted when it is appropriate to resume writing data to the stream.

```tsx
import fs from "node:fs";
// Write the data to the supplied writable stream one million times.
// Be attentive to back-pressure.
function writeOneMillionTimes(writer, data, encoding, callback) {
  let i = 1000000;
  write();
  function write() {
    let ok = true;
    do {
      i--;
      if (i === 0) {
        // Last time!
        writer.write(data, encoding, callback);
      } else {
        // See if we should continue, or wait.
        // Don't pass the callback, because we're not done yet.
        ok = writer.write(data, encoding);
      }
    } while (i > 0 && ok);
    if (i > 0) {
      // Had to stop early!
      // Write some more once it drains.
      writer.once("drain", write);
    }
  }
}

const writable = fs.createWriteStream("./output.txt");
writeOneMillionTimes(writable, Buffer.from("hello worlddd"));
```

#### Cork & UnCork

The `writable.cork()` method forces all written data to be buffered in memory.

When using `writable.cork()` and `writable.uncork()` to manage the buffering of writes to a stream, defer calls to `writable.uncork()` using `process.nextTick()`. Doing so allows **batching** of all `writable.write()` calls that occur within a given Node.js event loop phase.

```tsx
import fs from "node:fs";

const writableStream = fs.createWriteStream("output.txt");

writableStream.cork();

// 写入一些数据到可写流
writableStream.write("Data 1\n");
writableStream.write("Data 2\n");
writableStream.write("Data 3\n");

process.nextTick(() => {
  writableStream.uncork();
});
```

### Readable streams

#### Reading Mode

Readable streams effectively operate in one of two modes: flowing and paused.

- In flowing mode, data is read from the underlying system automatically and provided to an application as quickly as possible using events via the EventEmitter interface.

- In paused mode, the `stream.read()` method must be called explicitly to read chunks of data from the stream.

Adding a `data` event handler or Calling the `stream.pipe()` method will switch mode to flow.

`stream.resume()` and `stream.pause()` are a pair of methods used to toggle the mode.

Adding a `readable` event handler automatically makes the stream stop flowing, and the data has to be consumed via `readable.read()`. If the `readable` event handler is removed, then the stream will start flowing again if there is a `data` event handler.

#### Reading Data Using flow mode

```tsx
import fs from "node:fs";

const readStream = fs.createReadStream("./output.txt");

readStream.on("data", (data) => {
  console.log("data", data);
});

readStream.on("end", () => {
  console.log("stream close");
});
```

#### Reading Data Using paused mode

```tsx
import fs from "node:fs";

const readStream = fs.createReadStream("./output.txt");

readStream.on("readable", () => {
  console.log("read", readStream.read());
});

readStream.on("end", () => {
  console.log("stream close");
});
```

### Duplex

Duplex streams are streams that implement both the `Readable` and `Writable` interfaces.

```tsx
import { Duplex } from "stream";

const myDuplexStream = new Duplex({
  write(chunk, encoding, callback) {
    console.log(`Writing data: ${chunk}`);
    callback();
  },

  read(size) {
    const data = String.fromCharCode(this.currentCharCode++);
    if (this.currentCharCode > 90) {
      this.push(null); // 数据读取完毕，结束流
    } else {
      console.log(`Reading data: ${data}`);
      this.push(data);
    }
  },
});

// ASCII 'A'
myDuplexStream.currentCharCode = 65;

myDuplexStream.on("data", (chunk) => {
  console.log(`Received data: ${chunk}`);
});

myDuplexStream.write("Data 1");
myDuplexStream.write("Data 2");

myDuplexStream.end();
```

#### allowHalfOpen

If false then the stream will automatically end the writable side when the readable side ends. Set initially by the allowHalfOpen constructor option, which defaults to true.

### Transfrom

Transform streams are Duplex streams where the output is in some way related to the input.

#### Transfrom

All Transform stream implementations must provide a `_transform()` method to accept input and produce output.

```tsx
const { pipe, abort } = renderToPipeableStream(jsx, {
  bootstrapScripts: [...jsArr],
  onShellReady() {
    const injectableTransform = new Transform({
      // transform react html stream to inject style and store script
      transform(_chunk, _encoding, callback) {
        try {
          let chunk = _chunk;
          if (criticalStyles.size !== 0) {
            if (resultArr.length !== 0) {
              const result = resultArr[0];
              const applyScript = `<script async>
                const event = new CustomEvent('${STREAMING_DESERIALIZATION_EVENT}', {
                  detail: ${serialize(result, { isJSON: true })}
                });document.dispatchEvent(event);</script>`;
              chunk = joinChunk(applyScript, chunk);
            }

            const styles = [...criticalStyles.keys()]
              .map((key) => {
                const style = criticalStyles.get(key);
                return `<style type="text/css" id=${key}>${style}</style>`;
              })
              .join("");
            const applyStyle = `<script async>document.head.insertAdjacentHTML("beforeend", ${JSON.stringify(
              styles
            )});</script>`;
            chunk = joinChunk(applyStyle, chunk);
          }

          this.push(chunk);
          callback();
        } catch (e) {
          if (e instanceof Error) {
            callback(e);
          } else {
            callback(new Error("Received unkown error when streaming"));
          }
        }
      },
    });

    const styles = [...criticalStyles.keys()]
      .map((key) => {
        const style = criticalStyles.get(key);
        return `<style type="text/css" id=${key}>${style}</style>`;
      })
      .join("");

    res.statusCode = 200;
    res.setHeader("content-type", "text/html");
    res.write(`<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>React App</title>
        ${styles}
        <script>window.data=${serialize(store, { isJSON: true })}</script>
      </head>
      <body>
        <div id="main">`);
    criticalStyles.clear();
    pipe(injectableTransform).pipe(res);
  },
  onShellError(error) {
    console.log(error);
    res.statusCode = 500;
    res.setHeader("content-type", "text/html");
    res.end("<h1>Something went wrong</h1>");
  },
  onError(error) {
    console.error(error);
  },
});

function joinChunk<Chunk extends { toString: () => string }>(
  before = "",
  chunk: Chunk,
  after = ""
) {
  return `${before}${chunk.toString()}${after}`;
}
```

#### Flush

 This will be called when there is no more written data to be consumed, but before the `end` event is emitted signaling the end of the Readable stream.

```tsx
import { Transform } from 'stream';

const myTransformStream = new Transform({
  transform(chunk, encoding, callback) {
    const uppercasedChunk = chunk.toString().toUpperCase();
    this.push(uppercasedChunk);
    callback();
  },

  flush(callback) {
    this.push('Extra Data');
    callback();
  }
});

myTransformStream.on('data', (chunk) => {
  console.log(`Received data: ${chunk}`);
});

myTransformStream.write('Data 1');
myTransformStream.write('Data 2');

myTransformStream.end();
```

## TLS

### Prerequisite(priːˈrekwəzɪt) knowledge

![SSL HandShake](/ssl-handshake.png)

1. Introduction (ClientHello): Your browser sends a “ClientHello” message to the server when you request a secure website. This message contains essential information, including the random number, SSL/TLS versions it supports and the cipher suites it can use.

2. Server’s Response (ServerHello): The server replies with a “ServerHello” message, including the highest SSL/TLS version and cipher suite both parties support.

3. Server’s Credentials: The server presents its digital certificate, verified by a Certificate Authority (CA) such as `Let's Encrypt` like an ID card providing its authenticity.

4. Client’s Verification and Key Generation: Your browser validates the server’s certificate. Once verified, it uses the server’s public key to encrypt a `premaster secret`, a unique session key, and sends it back to the server.

5. Establishing a Secure Connection: The server decrypts the premaster secret with its private key. The server and client then compute the session key, which will be used for symmetric encryption of all communication.

### Examples

```shell
# generate a self-signed CERTIFICATE
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes -subj '/CN=localhost'
```

```tsx
// server.ts
import tls from 'tls';
import fs from 'fs';

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem'),
};

const server = tls.createServer(options, (socket) => {
  console.log('server connected',
              socket.authorized ? 'authorized' : 'unauthorized');
  socket.write('welcome!\n');
  socket.setEncoding('utf8');
  socket.pipe(socket);
});

server.listen(8000, () => {
  console.log('server bound');
});

// client.ts
import tls from 'tls';
import fs from 'fs';

const options = {
  // identify server
  ca: [ fs.readFileSync('cert.pem') ],
  // client can also pass key and cert, if the server need to identify it.
};

const socket = tls.connect(8000, options, () => {
  console.log('client connected', 
              socket.authorized ? 'authorized' : 'unauthorized');
  socket.write('hello I am client!\n');
});

socket.setEncoding('utf8');
socket.on('data', (data) => {
  console.log(data);
});
```

## Udp

```tsx
import dgram from 'node:dgram';

const server = dgram.createSocket('udp4');

server.on('message', (msg, rinfo) => {
  console.log(`server receive: ${msg} from ${rinfo.address}:${rinfo.port}`);
});

server.on('listening', () => {
  const address = server.address();
  console.log(`server is listening at ${address.address}:${address.port}`);
});

server.bind(41234);
// listening 0.0.0.0:41234

const client = dgram.createSocket('udp4');
const message = Buffer.from('this is a message');

client.send(message, 41234, 'localhost', (err) => {
  client.close();
});
```

## Util

```tsx
import util from 'node:util';
import fs from 'node:fs';

// inspect
const obj = { name: 'John', age: 30, city: 'New York' };
console.log(util.inspect(obj));

// promisify
const readFile = util.promisify(fs.readFile);

async function main() {
    const data = await readFile('./example.txt', 'utf8');
    console.log(data);
}

main();

//callbackify
function myAsyncFunction() {
    return new Promise((resolve, reject) => {
        resolve('Hello World!');
    });
}

const callbackFunction = util.callbackify(myAsyncFunction);

callbackFunction((err, ret) => {
    if (err) throw err;
    console.log(ret);
});
```

## Workers

```ts
import { fileURLToPath } from "node:url";
import { Worker, isMainThread, workerData } from "worker_threads";

const __filename = fileURLToPath(import.meta.url);

if (isMainThread) {
  const sharedBuffer = new SharedArrayBuffer(1 * Int32Array.BYTES_PER_ELEMENT);
  const sharedArray = new Int32Array(sharedBuffer);

  const worker1 = new Worker(__filename, { workerData: sharedBuffer });
  const worker2 = new Worker(__filename, { workerData: sharedBuffer });

  worker1.on("exit", () => {
    console.log(sharedArray);
  });

  worker2.on("exit", () => {
    console.log(sharedArray);
  });
} else {
  const sharedArray = new Int32Array(workerData);

  for (let i = 0; i < 10000; i++) {
    // thread race condition
    sharedArray[0]++;
    // solution
    // Atomics.add(sharedArray, 0, 1);
  }
}
```