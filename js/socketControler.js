var u = require('util');
var sc;
var sensorData = {
    x_tilt: 0,
    y_tilt: 0,
    angle_compass: 0,
    pitch_compass: 0,
    roll_compass: 0
};

(function() {
    loadIO();
})();
var ioTo;

function loadIO() {
    jQuery.getScript("http://" + global.cfg.sensorControlerHost + ":" + global.cfg.sensorControlerPort + "/socket.io/socket.io.js")
        .done(function() {
            connectControler();
            if (global.cfg.gpsUseCompass) {
                startSensor();
            } else {
                stopSensor();
            }

            setEnableEcho(global.cfg.ctrlEnableEcho);

            if (ioTo !== undefined) {
                clearTimeout(ioTo);
            }

            if(global.cfg.hydroAutoSteer){
                hydroStartAutoSteer();
            } else {
                hydroStopAutoSteer();
            }
        })
        .fail(function(jqxhr, settings, exception) {
            if (global.cfg.gpsUseCompass) {
                $('#btnGpsUseCompass').click();
            }
            ioTo = setTimeout(loadIO, 10000);
        });
}

function connectControler() {
    sc = io.connect(global.cfg.sensorControlerHost, {
        port: global.cfg.sensorControlerPort
    });
    sc.on('connect', function() {
        global.console.info("ctrl connected");
        setSensorSpeed();
        global.cfg.sensorConnected = true;
    });
    sc.on('disconnect', function() {
        global.console.info("ctrl disconnected");
        global.cfg.sensorConnected = false;
    });
    sc.on('cmdEcho', function(echo) {
        global.console.log("ctrl echo:" + u.inspect(echo));
    });

    sc.on('sensorData', function(data) {
        // global.console.log(u.inspect(data));
        sensorData = data;
    });

}

function setEnableEcho(enEcho) {
    sc.emit("controlerCmd", {
        cmd: "enableEcho",
        data: enEcho
    });
}
