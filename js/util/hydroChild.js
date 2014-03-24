var u = require('util');

var hydroDevicePath = "/dev/serial/by-id/usb-Silicon_Labs_CP2102_USB_to_UART_Bridge_Controller_01286-if00-port0";
var hydroDuration = 200; //200
var hydroSpeed = 510; //IMPORTANT: must add 10ms, otherwise relais hangs
var relaisWorking = false;
var timeoutPID = null;
var INITRELAIS = false;
var POINTSIDE = "middle";
var startSteer = false;
var con = false;

var debug = false;

var Fiber = require('fibers');
var serialport = require("serialport");
var SerialPort = serialport.SerialPort; // localize object constructor
var sp = null;

process.on('message', function(m) {
    // console.log("."+m);
    if (m.hydroSpeed !== undefined) {
        hydroSpeed = m.hydroSpeed + 10;
        if (debug) console.log("hydroSpeed:" + hydroSpeed);
    }
    if (m.hydroDuration !== undefined) {
        hydroDuration = m.hydroDuration;
        if (debug) console.log("hydroDuration:" + hydroDuration);
    }
    switch (m.cmd) {
        // case 'init':
        //     sendCmdEcho("init ok");
        //     if (debug) console.info('initRelais received');
        //     initCard();
        //     if (debug) console.info('Relais initiated');
        //     break;
        case 'setDevicePath':
            sendCmdEcho("setHydroDevicePath ok");
            if (debug) console.info('setHydroDevicePath received');
            hydroDevicePath = m.path;
            reconnectSerialPort();
            break;
        case 'startAutoSteer':
            sendCmdEcho("startAutoSteer ok");
            if (debug) console.info('startAutoSteer received');
            startSteer = true;
            break;
        case 'stopAutoSteer':
            sendCmdEcho("stopAutoSteer ok");
            if (debug) console.info('stopAutoSteer received');
            startSteer = false;
            break;
        case 'stop':
            sendCmdEcho("stop ok");
            if (debug) console.info('stop received');
            POINTSIDE = 0;
            middle();
            startSteer = false;
            break;
        case 'singleLeft':
            sendCmdEcho("singleLeft ok");
            if (debug) console.info('singleLeft received');
            if (!relaisWorking) {
                try {
                    directionFiber.run(1); //1 ... left
                } catch (e) {
                    console.log(e.stack);
                }
            }
            break;
        case 'singleRight':
            sendCmdEcho("singleRight ok");
            if (debug) console.info('singleRight received');
            if (!relaisWorking) {
                try {
                    directionFiber.run(2); //2 ... right
                } catch (e) {
                    console.log(e.stack);
                }
            }
            break;
        case 'pointSide':
            // console.log("ps: "+m.pointSide);
            POINTSIDE = m.pointSide;
            break;
    }
});

function sendCmdEcho(cmd) {
    process.send({
        origin: "hydroChild",
        cmd: "cmdEcho",
        msg: cmd
    });
}

/**
 * stops serialport and restarts a connection
 *
 */

function reconnectSerialPort() {
    if (sp !== undefined) {
        sp.close(function(error) {
            console.info("hydro serialport closed");
            sendCmdEcho("reconnect serialport closed");
            con = false;
            setupSerialPort();
        });

    }
}

function setupSerialPort() {

    if (hydroDevicePath !== undefined) {
        try {
            sp = new SerialPort(hydroDevicePath, {
                parser: serialport.parsers.raw,
                baudrate: 19200,
                databits: 8,
                stopbits: 1,
                parity: 0,

            });
        } catch (e) {
            console.log("hydro serialport error" + e);
        }
        sp.on('open', function() {
            console.log("hydro serialport open");
            sendCmdEcho("serialport open...");
            con = true;
            if (!INITRELAIS) {
                initCard(); //initialize relais-card, then wait
                setTimeout(main, 3000);
            }
        });
        sp.on('error', function(e) {
            con = false;
            console.error("hydro serialport error... " + data);
            sendCmdEcho("serialport error");
            reconnectSerialPort();
        });

        sp.on('data', function(d) {
            if (debug) console.log("data: " + d.readUInt8(0) + " " + d.readUInt8(1) + " " + d.readUInt8(2) + " " + d.readUInt8(3));
        });
    }
}

// x commandstructure
// Byte 0 command
// Byte 1 address of card
// Byte 2 data
// Byte 3 checksum (XOR from Byte0, Byte1 und Byte2 )
/**
 * creates the checksum for the packet
 * @param  {int} command [the command to issue]
 * @param  {int} address [address of the card (here always 1, because of only one card used)]
 * @param  {int} data    [the data to send to the relais-card]
 */

function getXOR(command, address, data) {
    var xor = command ^ address ^ data;
    return xor;
}

/**
 * initializes the relais-card by sending the init command
 */

function initCard() {
    var command = 1; //command: SETUP
    var address = 1; //important: address must not be 0, because the XOR won't work anymore...
    var data = 0;
    var xor = getXOR(command, address, data);
    var initCardCommand = new Buffer([command, address, data, xor]);
    sp.write(initCardCommand);

    INITRELAIS = true;
    console.log("Relais initialized");
}

/**
 * enables or disables a port (relais) on the card
 * @param {String} direction [the direction the hydraulic-cylinder should go]
 */

function setPort(direction) {
    if (debug) console.log('setPort');
    var command = 3; //command: SET PORT
    var address = 1; //wichtig address und data dürfen NICHT 0 sein weil sonst das xor nicht funktioniert!!!!
    var data;
    var xor;

    switch (direction) {
        case "left":
            data = 1;
            xor = 3;
            break;
        case "right":
            data = 2;
            xor = 0;
            break;
        case "middle":
            data = 0;
            xor = 2;
            break;
    }
    // var xor = getXOR(command, address, data);
    var setPortCommand = new Buffer([command, address, data, xor]);
    sp.write(setPortCommand);
}

function left() {
    clearTimeout(timeoutPID);
    relaisWorking = true;
    setPort("left");
    if (debug) console.log("relais_left");
    sleep(hydroDuration);
    middle();
}

function right() {
    clearTimeout(timeoutPID);
    relaisWorking = true;
    setPort("right");
    if (debug) console.log("relais_right");
    sleep(hydroDuration);
    middle();
}

function middle() {
    clearTimeout(timeoutPID);
    setPort("middle");
    if (debug) console.log("relais_middle");
    relaisWorking = false;
}

function sleep(ms) {
    var fiber = Fiber.current;
    timeoutPID = setTimeout(function() {
        fiber.run();
    }, ms);
    Fiber.yield();
}

var directionFiber = Fiber(function(direction) {
    switch (direction) {
        case 1:
            left();
            break;
        case 2:
            right();
            break;
    }

});

function main() {
    // console.log("main");

    if (startSteer) {
        if (!relaisWorking) {
            switch (POINTSIDE) {
                case 2: //if pointside is 2=right then steer left
                    // if (debug) console.log("main right");
                    directionFiber.run(1);
                    break;
                case 1: // if pointside is 1=left then steer right
                    // if (debug) console.log("main left");
                    directionFiber.run(2);
                    break;
                case 0: // pointside is 0=middle
                    middle();
                    break;
            }
        }
    }
    setTimeout(main, hydroSpeed); //damit mache ich eine loop! bei while(true) habe ich 50% Prozessorauslastung!!!
}

setupSerialPort();
