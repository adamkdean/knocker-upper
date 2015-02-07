var http = require('http'),
    apps = require('../config/apps');

var defaults = {
    port: 80,
    path: '/',
    method: 'HEAD',
    interval: 10*60*1000 // 10 minutes
}

initialiseIntervals();

function initialiseIntervals() {
    for(var i = 0; i < apps.length; i++) {
        (function(host, port, path, method, interval) {
            setInterval(function() {
                knockUp(host, port, path, method);
            }, interval);
        }(generateHerokuUrl(apps[i].host),
          apps[i].port || defaults.port,
          apps[i].path || defaults.path,
          apps[i].method || defaults.method,
          apps[i].interval || defaults.interval));
    }
}

function generateHerokuUrl(host) {
    return (host.indexOf('herokuapp.com') === -1)
        ? host + '.herokuapp.com'
        : host;
}

function knockUp(host, port, path, method) {
    var options = {
        host: host,
        port: port,
        path: path,
        method: method
    };

    var req = http.request(options, function (res) {
        console.log(host + ': request successful');
    });

    req.on('error', function (err) {
        console.log(host + ': error', err);
    });

    req.on('timeout', function () {
        console.log(host + ': connection timeout');
        req.abort();
    });

    req.end();
}
