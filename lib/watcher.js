const util = require('util'),
    cluster = require('./cluster');
// const { Etcd3 } = require('etcd3');
// re: Etcd Resolver
let re;
// client: etcd3.Client
let client;
let isInitialized = false;

module.exports = {
    // Next blocks until an update or error happens. It may return one or more
    // updates. The first call should get the full set of the results. It should
    // return an error if and only if Watcher cannot recover.
    next: async function () {
        prefix = util.format('/%s/%s/', this.re.prefix, this.re.serviceName);
        if (!isInitialized) {
            // let client = new Etcd3();
            // query address from etcd3 serers for init.
            console.log(prefix);
            let res = await this.client.getAll().prefix(prefix).strings();
            let servers = [];
            for (let key in res) {
                servers.push(res[key]);
            }
            cluster.init(this.re.protoPath, this.re.pkgName, this.re.serviceName, servers);
        } else {
            // watch & update pool
            this.client.watch().prefix(prefix).create().then(_watcher => {
                _watcher.on('put', res =>  console.log('PUT: ',res.value.toString()),cluster.updatePool('ADD', res.value.toString()));
                _watcher.on('delete', res => cluster.updatePool('DELETE', res.value.toString()));
            })
        }
    },
    close: function () {
        // Do nothing
    }
}