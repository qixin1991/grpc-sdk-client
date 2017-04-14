const grpc = require('grpc');

const _pool = [];
let counter = -1,
    _servers;

/**
 * gRPC cluster client with load banlance (RR) for nodejs.
 */
module.exports = {
    /**
     * @param {string} protoPath - proto file path.
     * @param {string} pkgName - grpc package name.
     * @param {string} serviceName - grpc service name.
     * @param {Array} servers - server array list. For example: [ { host: '127.0.0.1', port: 50051} ]
     */
    init: (protoPath, pkgName, serviceName, servers) => {
        if (_pool.length == 0) {
            _servers = servers;
            let rpc_proto = grpc.load(protoPath)[pkgName];
            for (let server of servers) {
                _pool.push(new rpc_proto[serviceName](`${server.host}:${server.port}`, grpc.credentials.createInsecure()))
            }
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