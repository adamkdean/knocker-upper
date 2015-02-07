var http = require('http'),
    apps = require('../config/apps');

var defaults = {
    port: 80,
    path: '/',
    method: 'HEAD',
    interval: 10*60*1000 // 10 minutes
}

initialiseHttpServer();
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

function initialiseHttpServer() {
    // we have to bind to the port Heroku gives us
    // or it thinks we've crashed and kills us
    http.createServer(function (request, response) {
      response.writeHead(200, {"Content-Type": "text/plain"});
      response.end("200 OK\n");
  }).listen(process.env.PORT);
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
