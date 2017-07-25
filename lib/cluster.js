const grpc = require('grpc');

const _pool = [];
let counter = -1,
    _servers,
    protoPath,
    pkgName,
    rpcServiceName,
    etcdServiceName;

/**
 * gRPC cluster client with load banlance (RR) for nodejs.
 */
module.exports = {
    /**
     * 初始胡连接池
     * @param {string} protoPath - proto file path.
     * @param {string} pkgName - grpc package name.
     * @param {string} etcdServiceName - grpc service name.
     * @param {Array} servers - server array list. For example: [ { host: '127.0.0.1', port: 50051} ]
     */
    init: function (protoPath, pkgName, etcdServiceName, rpcServiceName, servers) {
        console.log(protoPath, pkgName, etcdServiceName, rpcServiceName, servers);
        if (_pool.length == 0) {
            this.protoPath = protoPath;
            this.pkgName = pkgName;
            this.etcdServiceName = etcdServiceName;
            this.rpcServiceName = rpcServiceName;
            this._servers = servers;
            let rpc_proto = grpc.load(protoPath)[pkgName];
            for (let server of servers) {
                _pool.push({ name: server, client: new rpc_proto[rpcServiceName](server, grpc.credentials.createInsecure()) });
            }
        }
    },
    updatePool: function (op, addr) {
        let rpc_proto = grpc.load(this.protoPath)[this.pkgName];
        switch (op) {
            case 'ADD':
                let idx = -1;
                for (let i in _pool) {
                    if (_pool[i].name == addr) {
                        idx = i;
                        break;
                    }
                }
                if (idx == -1) // 已经存在的,则不重复添加
                    _pool.push({ name: addr, client: new rpc_proto[this.rpcServiceName](addr, grpc.credentials.createInsecure()) });
                break;
            case 'DELETE':
                counter = 0;
                for (let i in _pool) {
                    if (_pool[i].name == addr) {
                        _pool.splice(i, 1);
                        break;
                    }
                }
                break;
        }
    },
    /**
     * Exec the RPC function.
     * 
     * @param {string} rpcFunc - grpc function name.
     * @param {object} params - prams.
     * @param {function} callback - callback(err, res) function.
     */
    exec: function (rpcFunc, params, callback) {
        let client = this.getClient();
        client[rpcFunc](params, (err, res) => {
            callback(err, res);
        });
    },
    /**
     * Get client Connection from pool.
     */
    getClient: function () {
        console.log(_pool.length, _pool, ' Counter:', counter);
        if (counter < _pool.length - 1)
            counter++;
        else
            counter = 0;
        return _pool[counter].client;
    }

}