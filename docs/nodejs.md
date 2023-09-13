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

When you are using asynchronous operations during the execution process， and need pass some context.

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
const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/upload') {
    let data = [];

    req.on('data', chunk => {
      data.push(chunk);
    });

    req.on('end', () => {
      const buffer = Buffer.concat(data);

      fs.writeFile('uploaded-image.jpg', buffer, err => {
        if (err) {
          res.writeHead(500);
          res.end('Server error');
          return;
        }
        const base64Image = buffer.toString('base64');

        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(base64Image);
      });
    });
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(3000, () => {
  console.log('Server is running at http://localhost:3000');
});
```

## C++ Addon

### Set up

Install package `node-addon-api bindings` to use `#include <napi.h>`, `node-gyp` to compile.

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
import bindings from 'bindings';

const addon = bindings({
    bindings: 'hello.node',
    module_root: process.cwd()
})
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
spawn('ls',{
    stdio: 'inherit'
});
```

### Fork

```tsx
// child.ts
process.on('message', (msg) => {
  console.log('Message from parent:', msg);
});

let counter = 0;

setInterval(() => {
  process.send?.({ counter: counter++ })
}, 1000);

// parent.ts
import {fork} from 'child_process'

const child = fork('./child');

child.send({ hello: 'world' });

child.on('message', (msg) => {
  console.log('Message from child', msg);
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
use the  [PM2](https://github.com/Unitech/pm2) cluster mode for deploying Node.js.

If you want to monitor it, you can use [easy-monitor](https://github.com/hyj1991/easy-monitor).

### Usage

```tsx
import cluster from 'cluster';
import http from 'http';
import os from 'os'

const numCPUs = os.cpus().length;
console.log('cpus',numCPUs)

if (cluster.isPrimary) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs / 2; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  // Workers can share any TCP connection
  // In this case, it is an HTTP server
  http.createServer((req, res) => {
    res.writeHead(200);
    res.end('hello world\n');
  }).listen(8000);

  console.log(`Worker ${process.pid} started`);
}
```
