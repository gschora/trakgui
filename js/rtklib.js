var net = require('net');

autoConnectRtklib();
setStartStopBtnRtklib();
setRtklibIconColor();

/**
 * checks if rtklib is running, tcp-server is started and
 * sets global.cfgRtklibStatus if connected
 */

function autoConnectRtklib() {
    if (global.chkRtklibSocket === undefined) {
        global.chkRtklibSocket = net.connect({
            port: global.cfgRtklibPort
        }, function() {
            global.cfgRtklibStatus = 2;

        });

        global.chkRtklibSocket.on('data', function(data) {
            global.cfgRtklibStatus = 2;
            try {
                // global.console.log('data.toString()');
            } catch (e) {}

            processData(data);
            // global.chkRtklibSocket.end();
        });

        global.chkRtklibSocket.on('error', function() {
            try {
                global.chkRtklibSocket.destroy();
            } catch (e) {}
        });
    } else if (global.chkRtklibSocket.destroyed) {
        try {
            global.chkRtklibSocket.connect({
                port: global.cfgRtklibPort
            });
        } catch (e) {}

    }

    setTimeout(function() {
        autoConnectRtklib();
    }, 1000);
}

/**
 * starts rtklib in a new child
 */

function startRtklib() {
    if (global.childRtklib === undefined) {
        var spawn = require('child_process').spawn;
        global.childRtklib = spawn(global.cfgRtklibPath, global.cfgRtklibArgs, {});
        global.childRtklib.on('error', function(code) {
            // setRtklibIconColor();
            console.log('error on starting rtklib ' + code);
        });

        global.childRtklib.on('exit', function(code) {
            //makes troubles when site is reloaded and rtklib is then closed!!!
            //looks like console is then null
            try {
                console.log('rtklib process exited with code ' + code);
            } catch (e) {}
            global.childRtklib = undefined;
            // setRtklibIconColor();


        });

    }
}

/**
 * kills rtklib child process
 */

function stopRtklib() {
    if (global.childRtklib !== undefined) {
        global.childRtklib.kill();
    }
}

/**
 * adds click funtionality to the rtklib start/stop-button
 */

function setStartStopBtnRtklib() {
    $(".startRtklib a").click(function() {
        if (global.childRtklib !== undefined) {
            stopRtklib();
        } else {
            startRtklib();
        }
    });
}

/**
 * auto sets color of button according to status of rtklib
 * red - rtklib is not running, starts rtklib automatically
 * blue - rtklib is running but tcpserver is not started
 * green - rtklib is running and tcpserver is started, should give positions
 */

function setRtklibIconColor() {
    switch (global.cfgRtklibStatus) {
        case 0:
            $(".startRtklib a").css({
                "background-color": "#FE2E2E", //red
                "border-color": "#FF0000"
            });
            break;
        case 1:
            $(".startRtklib a").css({
                "background-color": "#2E64FE", //blue
                "border-color": "#0040FF"
            });
            break;
        case 2:
            $(".startRtklib a").css({
                "background-color": "#04B404", //green
                "border-color": "#088A08"
            });
            break;
    }

    if (global.childRtklib === undefined) {
        global.cfgRtklibStatus = 0;
        startRtklib();
    } else {
        global.cfgRtklibStatus = 1;
    }

    setTimeout(function() {
        setRtklibIconColor();
    }, 2000);
}

// var startgps = false;
// process.on('message', function(m) {



//     if (m == 'startgps') {
//         startgps = true;
//     } else {
//         startgps = false;
//     }



//     process.send("bin_im_child_ Process_");
//     sendgps();

//     // // Pass results back to parent process
//     // process.send(m.toUpperCase(m));
// });

// var i = 0;

// function sendgps() {
//     if (startgps) {
//         process.send(i);
//         i++;
//     }

//     setTimeout(function() {
//         sendgps();
//     }, 1000);
// }
