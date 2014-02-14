var net = require('net');
var pr = require('./processor');
var kal = require('./kalman');
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


var monitorOrig;
var monitor;
chkRtklibSocket.on('data', function(data) {
    monitorOrig = data.toString().trim().replace(/\s+/g, ",").split(",");
    if (monitorOrig[4] === 1) {
        updateKal(true)
    }


});

updateKal(false);
getKalPosition();


function getKalPosition() {
    var pos = kal.getPosition();


    var lat = pos.lat;
    var lon = pos.lon;

    if (monitor !== undefined) {
        if (monitor.length > 1) {
            if (s !== undefined && monitor !== undefined) {
                monitor[2] = parseFloat(lat.toPrecision(11));
                monitor[3] = parseFloat(lon.toPrecision(11));
                s.write(monitor.toString().replace(/,/, " ") + "\r\n");
                console.log("getPos");
            }

            // console.log(monitor.toString());
        }
    }


    setTimeout(getKalPosition, 300);
}


function updateKal(settime) {

    if (monitor !== undefined) {
        if (monitorOrig.length > 1) {
            kal.updateFilter(parseFloat(monitorOrig[2]), parseFloat(monitorOrig[3]));
            monitor = monitorOrig;
            console.log("update");
        }
    } else {
        monitor = monitorOrig;
    }
    if (!settime) {
        setTimeout(updateKal, 5000);
    }
}





chkRtklibSocket.on('error', function(data) {
    console.log("connection lost");
});
