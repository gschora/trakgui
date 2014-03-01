// var autoSend = false;
// var sensorSpeed = 500; //ms
// var sensorDevicePath;

// process.on("message", function(m) {
//     // console.log("m: "+m.key.name);
//     switch (m.command) {
//         case "start":
//             autoSend = true;
//             break;
//         case "stop":
//             autoSend = false;
//             break;
//         case "restart":

//             break;
//         case "setDevicePath":
//             sensorDevicePath = m.devicePath;
//             break;
//         case "setSpeed":
//             sensorSpeed = m.speed;
//             break;
//     }
// });

// function setupSerialPort() {
//     if (sensorDevicePath !== undefined) {
//         sp = new SerialPort(sensorDevicePath, {
//             parser: serialport.parsers.readline("\n"),
//             // parser: serialport.parsers.raw,
//             baudrate: 9600,
//             databits: 8,
//             stopbits: 1,
//             parity: 0,

//         });
//     }
// }

(function main() {
    process.send("hallo compass!!!");
    // if (autoSend) getSensorData();

    setTimeout(main, sensorSpeed); //damit mache ich eine loop! bei while(true) habe ich 50% Prozessorauslastung!!!
})();

/**
 * #####################################################################################################
 * helper functions, because sensor is on other laptop
 *
 */
// var u = require("util");
// var io = require('socket.io-client'),
//     socket = io.connect(process.argv[2], {
//         port: 8010
//     });
// socket.on('connect', function() {
//     // console.log("socket connected");
// });
// socket.emit('start', {});

// socket.on('sensor', function(data) {
//     // console.log(u.inspect(data));
//     if (global.cfg.gpsUseCompass) {
//         process.emit(data);
//     }
// });
process.send("hallo !!!");