var sc;
var sensorData = {
    x_tilt: 0,
    y_tilt: 0,
    angle_compass: 0,
    pitch_compass: 0,
    roll_compass: 0
};

(function() {
    setupSensor();
    setSensorSpeed();
})();

function setupSensor() {
    var fork = require('child_process').fork;
    sc = fork('./compass.js', [global.cfg.sensorDevicePath], {
        execPath: 'C:\\Proggis\\PortableApps\\nodist\\bin\\node.exe',
        silent: true
    }); 
    sc.on("message", function(m) {
        sensorData = m;
    });
    sc.on('error', function(m) {
        global.console.log(m);
    });
    sc.on("exit", function(m) {
        global.console.log("sc exit " + m);
    });
    sc.on("disconnect", function(m) {
        global.console.log("sc disconnect " + m);
    });

}

function setSensorSpeed() {
    sc.send({
        command: "setSpeed",
        speed: global.cfg.sensorSpeed
    });
}

function setDevicePath() {
    sc.send({
        command: "setDevicePath",
        path: global.cfg.sensorDevicePath
    });
}

function startSensor() {
    sc.send({
        command: "start"
    });
}

function stopSensor() {
    sc.send({
        command: "stop"
    });
}

function restartSensor() {
    sc.kill(2);
    setupSensor();
    setSensorSpeed();
}

function getSensorData() {
    if (global.cfg.gpsUseCompass) {
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
