const { Etcd3 } = require('etcd3');

let prefix,
    protoPath,
    pkgName,
    etcdServiceName,
    rpcServiceName;

module.exports = {
    init: function (prefix, etcdServiceName, rpcServiceName, protoPath = null, pkgName = null) {
        if (prefix == null || prefix == '') {
            console.error('No prefix provided!');
            process.exit(1);
        }
        if (etcdServiceName == null || etcdServiceName == '') {
            console.error('No etcd service name provided!');
            process.exit(1);
        }
        if (rpcServiceName == null || rpcServiceName == '') {
            console.error('No rpc service name provided!');
            process.exit(1);
        }
        if (protoPath == null || protoPath == '') {
            console.error('No proto path provided!');
            process.exit(1);
        }
        if (pkgName == null || pkgName == '') {
            console.error('No package name provided!');
            process.exit(1);
        }
        this.prefix = prefix;
        this.rpcServiceName = rpcServiceName;
        this.etcdServiceName = etcdServiceName;
        this.protoPath = protoPath;
        this.pkgName = pkgName;
    },
    /**
     * @param {string} target - etcd3 server strings.
     */
    resolve: function (target) {
        let client = new Etcd3({ hosts: target.split(',') });
        let watcher = require('./watcher');
        watcher.re = this;
        watcher.client = client;
        // return { resolver: this, client: client };
        return watcher;
    }
}