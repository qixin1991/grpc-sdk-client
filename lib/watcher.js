const util = require('util');
// const { Etcd3 } = require('etcd3');
// re: Etcd Resolver
let re;
// client: etcd3.Client
let client;
let isInitialized = false;
let cluster;

module.exports = {
    // Next blocks until an update or error happens. It may return one or more
    // updates. The first call should get the full set of the results. It should
    // return an error if and only if Watcher cannot recover.
    next: async function () {
        prefix = util.format('/%s/%s/', this.re.prefix, this.re.etcdServiceName);
        if (!isInitialized) {
            // let client = new Etcd3();
            // query address from etcd3 serers for init.
            // console.log(prefix);
            let res = await this.client.getAll().prefix(prefix).strings();
            let servers = [];
            for (let key in res) {
                servers.push(res[key]);
            }
            this.cluster = require('./cluster');
            console.log('  ---> init cluster...');
            this.cluster.init(this.re.protoPath, this.re.pkgName, this.re.etcdServiceName, this.re.rpcServiceName, servers);
        }
        // watch & update pool
        this.client.watch().prefix(prefix).create().then(_watcher => {
            _watcher.on('put', res => {
                console.log('PUT:', res.value.toString());
                this.cluster.updatePool('ADD', res.value.toString());
            });
            _watcher.on('delete', res => {
                console.log('DELETE:', res.key.toString().split('/').slice(-1)[0]);
                let addr = res.key.toString().split('/').slice(-1)[0];
                this.cluster.updatePool('DELETE', addr);
            });
        })

    },
    close: function () {
        // Do nothing
    },
     getClusterClient: function() {
        return this.cluster;
    }
}