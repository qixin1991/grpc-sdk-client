/**
 * Warning: This is just a test for sdk.
 */

const grpc = require('grpc'),
    path = require('path'),
    protoPath = path.join(__dirname, 'rpc', 'hw.proto');
// Client = grpc.load(path.join(__dirname, 'rpc', 'hw.proto'))['rpc'];
const resolver = require('./lib/resolver');

resolver.init('etcd3_naming', 'hello_service','Greeter', protoPath, 'rpc');

let watcher = resolver.resolve('172.20.9.101:2379,172.20.9.103:2379,172.20.9.105:2379');

watcher.next();
let ticker = setInterval(() => {
    try {
        watcher.cluster.exec('sayHello', { name: 'wuji' }, (err, res) => {
            console.log(res);
        });
    } catch (error) {
        console.error(error);
        clearInterval(ticker);
    }
}, 2000);
