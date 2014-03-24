function setSensorSpeed(val) {
    sc.emit("sensorCmd", {
        cmd: "setSpeed",
        sensorSpeed: (val === undefined) ? global.cfg.imuSensorSpeed : parseInt(val)
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

function resetCalSensor () {
    sc.emit("sensorCmd", {
        cmd: "resetCal"
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
