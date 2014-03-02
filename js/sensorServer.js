/**
 *  this is a hack, because there are troubles with process.fork in node-webkit
 *  so we make a normal node server with socke.io
 *
 *  this needs to be run in a seperate process. start with
 *  node sensorServer.js
 *
 */

var autoSend = false;
var sensorSpeed = 500; //ms
var sensorDevicePath = "/dev/serial/by-id/usb-FTDI_USB_Serial_Converter_FTFVL144-if00-port0";
var con = false;
var init = false;
var sp, sock;

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
    socket.on('command', function(com) {
        switch (com.cmd) {
            case "start":
                sock.emit("cmdEcho", {
                    cmd: "start",
                    msg: "start ok"
                });
                autoSend = true;
                break;
            case "stop":
                sock.emit("cmdEcho", {
                    cmd: "stop",
                    msg: "stop ok"
                });
                autoSend = false;
                break;
            case "restart":
                sock.emit("cmdEcho", {
                    cmd: "restart",
                    msg: "restart ok"
                });
                reconnectSerialPort();
                break;
            case "setDevicePath":
                sock.emit("cmdEcho", {
                    cmd: "setDevicePath",
                    msg: "setDevicePath ok"
                });
                sensorDevicePath = com.devicePath;
                break;
            case "setSpeed":
                sock.emit("cmdEcho", {
                    cmd: "setSpeed",
                    msg: "setSpeed ok"
                });
                sensorSpeed = parseInt(com.sensorSpeed);
                break;
            case "calibrate":
                sock.emit("cmdEcho", {
                    cmd: "calibrate",
                    msg: "calibrate start"
                });
                calibrate();
                break;
        }
    });
});


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
            logger.info("serialport open...");
            con = true;
        });

        sp.on("error", function(data) {
            con = false;
            logger.error("serialport error... " + data);
        });

        sp.on("data", function(data) {
            var dataList = data.split(",");
            // logger.info(data);
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
            logger.info("serialport closed");
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
        sock.emit("sensorData", sensor);

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
            sock.emit("cmdEcho", {
                cmd: "calibrate",
                msg: "calibrate north set! now rotate 90deg...then hit button"
            });
            sp.write("KN");
            sock.emit("cmdEcho", "");
            calSide++;
            cd = 60;
            countdown();
            break;
        case 1:
            clearTimeout(to);
            sp.write("N");
            sock.emit("cmdEcho", {
                cmd: "calibrate",
                msg: "calibrate east set! now rotate 90deg...then hit button"
            });
            calSide++;
            cd = 60;
            countdown();
            break;
        case 2:
            clearTimeout(to);
            sp.write("N");
            sock.emit("cmdEcho", {
                cmd: "calibrate",
                msg: "calibrate south set! now rotate 90deg...then hit button"
            });
            calSide++;
            cd = 60;
            countdown();
            break;
        case 3:
            clearTimeout(to);
            cd = 60;
            sp.write("N");
            sock.emit("cmdEcho", {
                cmd: "calibrate",
                msg: "calibrate  west set! finished!!!"
            });
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
