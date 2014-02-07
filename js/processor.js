var net = require('net');
var prcsPosClient;

processRtklibPosition();

function processRtklibPosition() {
    if (global.childRtklib !== undefined && rtklibConnect) {
        prcsPosClient = net.connect({
                port: global.cfgRtklibPort
            },
            function() { //'connect' listener
                // try {
                //     console.log('rtklib connected');
                // } catch (e) {}
            });
        prcsPosClient.on('data', function(data) {
            try {
                console.log(data.toString());
            } catch (e) {}

            prcsPosClient.end();
        });
        prcsPosClient.on('error', function(code) {
            try {
                console.log('error while trying to connect to rtklib: ' + code);
            } catch (e) {}
        });
    }
    // if (prcsPosClient === undefined) {
    setTimeout(function() {
        processRtklibPosition();
    }, 2000);

}
