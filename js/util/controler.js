var u = require('util');
var sock;
var enableEcho = true;
var startSensor = false;
var debug = false;

(function() {
    startSensorChild();
    startHydroChild();
    heartbeat();
})();

/**
 * sets up socket.io server
 *
 */
var io = require('socket.io').listen(8010);
var logger = io.log;
io.set('log level', 1);

/**
 * receives commands over socket.io
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
    socket.on('hydroCmd', function(msg) {
        parseMsgToHydroChild(msg);
    });
    socket.on('controlerCmd', function(msg) {
        parseMsgToControler(msg);
    });
});

var sensorChild;
var hydroChild;

function startSensorChild() {
    var fork = require('child_process').fork;
    sensorChild = fork('./js/util/sensorChild');
    sensorChild.on('error', function(e) {
        console.log("sensorchild error " + e);
    });

    sensorChild.on('close', function(e) {
        console.log("sensorChild close " + e);
        startSensorChild();
    });

    sensorChild.on('message', function(msg) {
        // console.log("ctrl: " + u.inspect(msg));
        parseMsgFromChild(msg);
    });
    if (startSensor) {
        sensorChild.send({
            cmd: "start"
        });
    } else {
        sensorChild.send({
            cmd: "stop"
        });
    }
}

function startHydroChild() {
    var fork = require('child_process').fork;
    hydroChild = fork('./js/util/hydroChild');
    hydroChild.on('error', function(e) {
        console.log("hydroChild error " + e);
    });
    hydroChild.on('close', function(e) {
        console.log("hydroChild close " + e);
        startHydroChild();
    });
    hydroChild.on('message', function(msg) {
        parseMsgFromChild(msg);
    });
}

function parseMsgToControler(msg) {
    switch (msg.cmd) {
        case "enableEcho":
            enableEcho = msg.data;
            sock.emit("cmdEcho", {
                origin: "controler",
                cmd: "cmdEcho",
                msg: (enableEcho) ? "enableEcho true ok" : "enableEcho false ok"
            });
            break;
    }
}

function parseMsgToSensorChild(msg) {
    // console.log("ctrl: " + u.inspect(msg));
    switch (msg.cmd) {
        case "start":
            sensorChild.send(msg);
            startSensor = true;
            break;
        case "stop":
            sensorChild.send(msg);
            startSensor = false;
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
        case "resetCal":
            sensorChild.send(msg);
    }
}

function parseMsgToHydroChild(msg) {
    if (debug) console.log("ctrlhydro: " + u.inspect(msg));
    hydroChild.send(msg);
}

function parseMsgFromChild(msg) {
    // console.log("rectrl: " + u.inspect(msg));
    if (sock !== undefined) {
        switch (msg.cmd) {
            case "cmdEcho":
                if (enableEcho) sock.emit("cmdEcho", msg);
                break;
            case "sensorData":
                sock.emit("sensorData", msg.data);
                break;
        }
    }
}

function heartbeat() {
    if (sensorChild !== undefined) {
        sensorChild.send({
            cmd: "heartbeat"
        });
    }
    setTimeout(heartbeat, 15000);
}
