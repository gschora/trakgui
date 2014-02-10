var net = require('net');
var pr = require('./processor');
var i = 0;

var chkRtklibSocket = net.connect({
    port: 52001
}, function() {
    console.log("connected");

});
var s;
var monitorServer = net.createServer(function(sock) {
    s = sock;
    console.log('CONNECTED: ' + sock.remoteAddress + ':' + sock.remotePort);

    sock.on('data', function(data) {
        console.log('DATA ' + sock.remoteAddress + ': ' + data);
     });

    sock.on('close', function(data) {
        // console.log('CLOSED: ' + sock.remoteAddress + ' ' + sock.remotePort);
    });
    sock.on('error', function(data) {
        // console.log('error: ' + sock.remoteAddress + ' ' + sock.remotePort);
    });

}).listen(8005, '127.0.0.1');

chkRtklibSocket.on('data', function(data) {
    // if (i > 10) {
    //     chkRtklibSocket.destroy();
    // }

    var monitor = data.toString().trim().replace(/\s+/g, ",").split(",");
    // console.log(monitor);


    if (monitor.length > 1) {

        if (s !== undefined) {
            // console.log(monitor.toString() + "\n");
            s.write(monitor.toString().replace(/,/," ") + "\r\n");
        }
    }

    // console.log(data.toString());
    // // console.log(data.toString().length);
    // if (data.toString().length > 1) {
    //     pr.convdata(data);
    // }


});

chkRtklibSocket.on('error', function(data) {
    console.log("connection lost");
});
