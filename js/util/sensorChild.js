var u = require("util");

var autoSend = false;
var sensorSpeed = 500; //ms
var sensorDevicePath = "/dev/serial/by-id/usb-FTDI_USB_Serial_Converter_FTFVL144-if00-port0";
var con = false;
var init = false;
var sp;

var serialport = require("serialport");
var SerialPort = serialport.SerialPort;

var sensor = {
    x_tilt: 0,
    y_tilt: 0,
    angle_compass: 0,
    pitch_compass: 0,
    roll_compass: 0
};
var tilt = false;
var compass = false;

process.on('message', function(msg) {
    // console.log("chld: "+u.inspect(msg));
    switch (msg.cmd) {
        case "start":
            sendCmdEcho("start ok");
            autoSend = true;
            break;
        case "stop":
            sendCmdEcho("stop ok");
            autoSend = false;
            break;
        case "reconnect":
            sendCmdEcho("reconnect ok");
            reconnectSerialPort();
            break;
        case "setDevicePath":
            sendCmdEcho("setDevicePath ok");
            sensorDevicePath = msg.devicePath;
            break;
        case "setSpeed":
            sendCmdEcho("setSpeed ok");
            sensorSpeed = parseInt(msg.sensorSpeed);
            break;
        case "calibrate":
            sendCmdEcho("calibrate ok");
            calibrate();
            break;
    }
});

function sendCmdEcho(cmd) {
    process.send({
        origin: "sensorChild",
        cmd: "cmdEcho",
        msg: cmd
    });
}

/**
 * connects to serialport and sets up eventlisteners
 *
 */

function setupSerialPort() {
    if (sensorDevicePath !== undefined) {
        sp = new SerialPort(sensorDevicePath, {
            parser: serialport.parsers.readline("\n"),
            // parser: serialport.parsers.raw,
            baudrate: 9600,
            databits: 8,
            stopbits: 1,
            parity: 0,
        });

        sp.on("open", function() {
            sp.write("p");
            console.info("serialport open...");
            sendCmdEcho("serialport open...");
            con = true;
        });

        sp.on("error", function(data) {
            con = false;
            console.error("serialport error... " + data);
            sendCmdEcho("serialport serialport error");
        });

        sp.on("data", function(data) {
            var dataList = data.split(",");
            // console.info(data);
            switch (dataList[0]) {
                case 'T':
                    resetData();
                    if (!tilt) parseSensorTilt(dataList);
                    break;
                case 'C':
                    resetData();
                    if (!compass) parseSensorCompass(dataList);
                    break;
            }
        });
    }
}

/**
 * stops serialport and restarts a connection
 *
 */

function reconnectSerialPort() {
    if (sp !== undefined) {
        sp.close(function(error) {
            console.info("serialport closed");
            sendCmdEcho("reconnect serialport closed");
            con = false;
            setupSerialPort();
        });

    }
}
/**
 * sends commands to serialport/sensor
 *
 */

function getSensorData() {
    sp.write("C");
    sp.write("T");
}

/**
 * parses sensor data and saves compass part in variable
 * @param  {String} data [raw sensor data sent back after "C" command]
 */

function parseSensorCompass(data) {
    var angle_compass = data[2].split("=")[1] / 10;
    var pitch_compass = (data[3].split("=")[1] * 180 / 170).toPrecision(2);
    var roll_compass = (data[4].split("=")[1] * 180 / 170).toPrecision(2);

    sensor.angle_compass = parseFloat(angle_compass);
    sensor.pitch_compass = parseFloat(pitch_compass);
    sensor.roll_compass = parseFloat(roll_compass);
    compass = true;
}

/**
 * parses sensor data and saves accelerometer part in variable
 * @param  {String} data [raw sensor data sent back after "T" command]
 */

function parseSensorTilt(data) {
    var x_tilt = data[2].split("=")[1] / 10;
    var y_tilt = data[3].split("=")[1] / 10;

    sensor.x_tilt = parseFloat(x_tilt);
    sensor.y_tilt = parseFloat(y_tilt);
    tilt = true;

}

/**
 * sends all sensor data back to client and clears the sensordata object
 *
 */

function resetData() {
    if (tilt && compass) {
        // console.log(u.inspect(sensor));

        process.send({
            origin: "sensorChild",
            cmd: "sensorData",
            data: sensor
        });

        sensor.x_tilt = 0;
        sensor.y_tilt = 0;
        sensor.angle_compass = 0;
        sensor.pitch_compass = 0;
        sensor.roll_compass = 0;

        tilt = false;
        compass = false;
    }
}

var cd = 60;
var calSide = 0;

/**
 * starts calibrate process and on every call makes another step in the 4-step-calibration process
 * also starts a 60sec counter for each step
 *
 */

function calibrate() {
    switch (calSide) {
        case 0:
            sendCmdEcho("calibrate north set! now rotate 90deg...then hit button");
            sp.write("KN");
            calSide++;
            cd = 60;
            countdown();
            break;
        case 1:
            clearTimeout(to);
            sp.write("N");
            sendCmdEcho("calibrate east set! now rotate 90deg...then hit button");
            calSide++;
            cd = 60;
            countdown();
            break;
        case 2:
            clearTimeout(to);
            sp.write("N");
            sendCmdEcho("calibrate south set! now rotate 90deg...then hit button");
            calSide++;
            cd = 60;
            countdown();
            break;
        case 3:
            clearTimeout(to);
            cd = 60;
            sp.write("N");
            sendCmdEcho("calibrate  west set! finished!!!");
            calSide = 0;
            break;
    }
}

var to;
/**
 * the counter for calibration-process-steps
 *
 */

function countdown() {
    console.log("sec: " + cd--);

    if (cd <= 0) {
        clearTimeout(to);

    } else {
        to = setTimeout(countdown, 1000);
    }
}

setupSerialPort();
/**
 * loop for getting sensor data with sensorspeed
 *
 */
(function main() {
    if (autoSend && con) getSensorData();

    setTimeout(main, sensorSpeed); //damit mache ich eine loop! bei while(true) habe ich 50% Prozessorauslastung!!!
})();
