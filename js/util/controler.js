var u = require('util');
var sock;


(function() {
    startSensorChild();
})();

/**
 * sets up socket.io server
 *
 */
var io = require('socket.io').listen(8010);
var logger = io.log;
io.set('log level', 1);

/**
 * receives commands over socker.io
 * [start] sending sensordata
 * [stop] sending sensor data
 * [restart] serialport connection
 * [setDevicePath] sets serialport device path
 * [setSpeed] sets speed of loop for checking sensordata
 * [calibrate] initiates compass calibration
 */
io.sockets.on('connection', function(socket) {
    sock = socket;
    socket.on('sensorCmd', function(msg) {
        parseMsgToSensorChild(msg);
    });
});

var sensorChild;

function startSensorChild() {
    var fork = require('child_process').fork;
    sensorChild = fork('./sensorChild');
    sensorChild.on('error', function() {
        console.log("sensorchild error");
    });

    sensorChild.on('close', function() {
        console.log("sensorChild close");
    });

    sensorChild.on('message', function(msg) {
        // console.log("ctrl: " + u.inspect(msg));
        switch (msg.origin) {
            case "sensorChild":
                parseMsgFromSensorChild(msg);
                break;
        }
    });

}

function parseMsgToSensorChild(msg) {
    // console.log("ctrl: " + u.inspect(msg));
    switch (msg.cmd) {
        case "start":
            sensorChild.send(msg);
            break;
        case "stop":
            sensorChild.send(msg);
            break;
        case "reconnect":
            sensorChild.send(msg);
            break;
        case "setDevicePath":
            sensorChild.send(msg);
            break;
        case "setSpeed":
            sensorChild.send(msg);
            break;
        case "calibrate":
            sensorChild.send(msg);
            break;
    }
}

function parseMsgFromSensorChild(msg) {
	// console.log("rectrl: " + u.inspect(msg));
    if (sock !== undefined) {
        switch (msg.cmd) {
            case "cmdEcho":
                sock.emit("cmdEcho", msg);
                break;
            case "sensorData":
                sock.emit("sensorData", msg.data);
                break;
        }
    }
}
