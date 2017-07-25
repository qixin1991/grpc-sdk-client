const resolver = require('./lib/resolver');

resolver.init('etcd3_naming','hello_service');

let watcher = resolver.resolve('172.20.9.101:2379,172.20.9.103:2379,172.20.9.105:2379');

watcher.next();