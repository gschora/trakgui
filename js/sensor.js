var u = require('util');
var sc;
var sensorData = {
    x_tilt: 0,
    y_tilt: 0,
    angle_compass: 0,
    pitch_compass: 0,
    roll_compass: 0
};

jQuery.getScript("http://" + global.cfg.sensorControlerHost + ":" + global.cfg.sensorControlerPort + "/socket.io/socket.io.js")
    .done(function() {
        connectSensor();
    });

function connectSensor() {
    sc = io.connect(global.cfg.sensorControlerHost, {
        port: global.cfg.sensorControlerPort
    });
    sc.on('connect', function() {
        global.console.info("sensor connected");
        global.cfg.sensorConnected = true;
    });
    sc.on('disconnect', function() {
        global.console.info("sensor disconnected");
        global.cfg.sensorConnected = false;
    });
    sc.on('cmdEcho', function(echo) {
        global.console.log("sensor echo:"+u.inspect(echo));
    });

    sc.on('sensorData', function(data) {
        // global.console.log(u.inspect(data));
        sensorData = data;
    });

}

function setSensorSpeed() {
    sc.emit("sensorCmd", {
        cmd: "setSpeed",
        sensorSpeed: global.cfg.sensorSpeed
    });
}

function setSensorDevicePath() {
    sc.emit("sensorCmd", {
        cmd: "setDevicePath",
        devicePath: global.cfg.sensorDevicePath
    });
}

function startSensor() {
    sc.emit("sensorCmd", {
        cmd: "start"
    });
}

function stopSensor() {
    sc.emit("sensorCmd", {
        cmd: "stop"
    });
}

function reconnectSensor() {
    sc.emit("sensorCmd", {
        cmd: "reconnect"
    });
}

function calibrateSensor() {
    sc.emit("sensorCmd", {
        cmd: "calibrate"
    });
}

function getSensorData(now) {
    if (now) {
        return sensorData;
    } else if (global.cfg.gpsUseCompass) {
        return sensorData;
    } else {
        return {
            x_tilt: 0,
            y_tilt: 0,
            angle_compass: 0,
            pitch_compass: 0,
            roll_compass: 0
        };
    }

}
