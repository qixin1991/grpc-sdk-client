const grpc = require('grpc');

const servicePool = []; // 多服务实例数组

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
        let exist = false;
        servicePool.forEach((v) => {
            if (v.serviceName == serviceName)
                exist = true;
        });
        if (exist) { 
            // do nothing
        } else { 
            let pool = [];
            pool.serviceName = serviceName;
            pool.counter = -1;
            let rpc_proto = grpc.load(protoPath)[pkgName];
            for (let server of servers) {
                pool.push(new rpc_proto[serviceName](`${server.host}:${server.port}`, grpc.credentials.createInsecure()))
            }
            servicePool.push(pool);
        }
    },
    /**
     * Exec the RPC function.
     * 
     * @param {string} rpcFunc - grpc function name.
     * @param {object} params - prams.
     * @param {function} callback - callback(err, res) function.
     */
    exec: function (serviceName, rpcFunc, params, callback) {
        let client = this.getClient(serviceName);
        client[rpcFunc](params, (err, res) => {
            callback(err, res);
        });
    },
    /**
     * Get client Connection from pool.
     */
    getClient: function (serviceName) {
        let _pool = servicePool.filter(v => v.serviceName == serviceName)[0];
        if (_pool.counter < _pool.length - 1)
            _pool.counter++;
        else
            _pool.counter = 0;
        return _pool[_pool.counter];
    }

}