grpc-sdk-client
===

gRPC cluster client with load banlance (RR) for nodejs.

### Usage

Two steps use this sdk.

- 1. init the sdk.
- 2. just invoke the `exec()` function.

Here is the example code:

```
.
├── app.js
├── README.md
├── auth_rpc.proto
├── dao
│   ├── auth.js
```

*auth_rpc.proto*:

```
syntax="proto3";

package auth_rpc;

service CheckAuth {
    rpc check (UserInfo) returns (Accessable);
}   

message UserInfo {
    string token = 1;
    string method = 2;
    string url = 3;
}

message Accessable {
    bool result = 1;
    string ip = 2;
}
```

*dao/auth.js*:

```
const rpc = require('grpc-sdk-client');

rpc.init(__dirname + '/../auth_rpc.proto', 'auth_rpc',
    'CheckAuth', [
        {
            host: 'localhost',
            port: 50051
        }
    ]);

module.exports = {
    check: () => {
        return new Promise(
            (resolve) => {
                rpc.exec('check', { token: '3doojhfdd234324', method: 'GET', url: '/v1/api/users' }, (err, res) => {
                    resolve({ err: err, res: res });
                })
            }
        )
    }
}

```

> NOTE: grpc server needs starting first! While everything is ready, you'll get the result: `{
  "err": null,
  "res": {
    "result": true,
    "ip": "172.20.9.112"
  }
}`

Good Luck!
