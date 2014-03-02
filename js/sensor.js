var sc;
var sensorData = {
    x_tilt: 0,
    y_tilt: 0,
    angle_compass: 0,
    pitch_compass: 0,
    roll_compass: 0
};

jQuery.getScript("http://" + global.cfg.sensorDevicePath + ":" + global.cfg.sensorDevicePort + "/socket.io/socket.io.js")
    .done(function() {
        connectSensor();
    });

function connectSensor() {
    sc = io.connect(global.cfg.sensorDevicePath, {
        port: global.cfg.sensorDevicePort
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
        global.console.log(echo);
    });

    sc.on('sensorData', function(data) {
        // console.log(u.inspect(data));
        sensorData = data;
    });

}

function setSensorSpeed() {
    sc.emit("command", {
        cmd: "setSpeed",
        sensorSpeed: global.cfg.sensorSpeed
    });
}

function setSensorDevicePath() {
    sc.emit("command", {
        cmd: "setDevicePath",
        devicePath: global.cfg.sensorDevicePath
    });
}

function startSensor() {
    sc.emit("command", {
        cmd: "start"
    });
}

function stopSensor() {
    sc.emit("command", {
        cmd: "stop"
    });
}

function restartSensor() {
    sc.emit("command", {
        cmd: "restart"
    });
}

function calibrateSensor() {
    sc.emit("command", {
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
