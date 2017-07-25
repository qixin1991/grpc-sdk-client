const grpc = require('grpc');

const _pool = [];
let counter = -1,
    _servers,
    protoPath,
    pkgName,
    serviceName;

/**
 * gRPC cluster client with load banlance (RR) for nodejs.
 */
module.exports = {
    /**
     * 初始胡连接池
     * @param {string} protoPath - proto file path.
     * @param {string} pkgName - grpc package name.
     * @param {string} serviceName - grpc service name.
     * @param {Array} servers - server array list. For example: [ { host: '127.0.0.1', port: 50051} ]
     */
    init: function (protoPath, pkgName, serviceName, servers) {
        if (_pool.length == 0) {
            this.protoPath = protoPath;
            this.pkgName = pkgName;
            this.serviceName = serviceName;
            this._servers = servers;
            let rpc_proto = grpc.load(protoPath)[pkgName];
            for (let server of servers) {
                _pool.push({ name: server, client: new rpc_proto[serviceName](server, grpc.credentials.createInsecure()) });
            }
        }
    },
    updatePool: function (op, addr) {
        let rpc_proto = grpc.load(this.protoPath)[this.pkgName];
        switch (op) {
            case 'ADD':
                this._pool.push({name: addr, client: new rpc_proto[this.serviceName](server, grpc.credentials.createInsecure())});
                break;
            case 'DELETE':
                this._pool.splice(this._pool.indexOf(addr));
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
        if (counter < _servers.length - 1)
            counter++;
        else
            counter = 0;
        return _pool[counter];
    }

}