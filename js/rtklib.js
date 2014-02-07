var net = require('net');
var rtklibConnect = false;
var chkRtklibClient;

checkRtklib();
setStartStopBtnRtklib();
setRtklibIconColor();

/**
 * checks if rtklib is running and tcp-server is started
 * @return nothing
 */

function checkRtklib() {
    // setRtklibIconColor();
    chkRtklibClient = net.connect({
            port: global.cfgRtklibPort
        },
        function() { //'connect' listener
            if (global.cfgDebug) {
                try {
                    console.log('rtklib connected');
                } catch (e) {}
            }

        });
    chkRtklibClient.on('data', function(data) {
        rtklibConnect = true;
        // setRtklibIconColor();
        chkRtklibClient.end();
    });
    chkRtklibClient.on('end', function() {
        if (global.cfgDebug) {
            try {
                console.log('rtklib disconnected');
            } catch (e) {}
        }

        rtklibConnect = false;
        // setRtklibIconColor();
    });
    chkRtklibClient.on('error', function() {
        if (global.cfgDebug) {
            try {
                if (global.childRtklib === undefined) {
                    console.log('rtklib not running?');
                } else {
                    console.log('rtklib running but not started?');
                }

            } catch (e) {}
        }


        rtklibConnect = false;
        // setRtklibIconColor();
    });
    setTimeout(function() {
        checkRtklib();
    }, 1000);
}

/**
 * starts rtklib in a new child
 * @return nothing
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
 * @return nothing
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
 * sets color of button according to status of rtklib
 * red - rtklib is not running
 * blue - rtklib is running but tcpserver is not started
 * green - rtklib is running and tcpserver is started, should give positions
 */

function setRtklibIconColor() {
    if (rtklibConnect) {
        $(".startRtklib a").css({
            "background-color": "#04B404", //green
            "border-color": "#088A08"
        });
    }
    if (global.childRtklib === undefined) {
        $(".startRtklib a").css({
            "background-color": "#FE2E2E", //red
            "border-color": "#FF0000"
        });
    }
    if (global.childRtklib !== undefined && !rtklibConnect) {
        $(".startRtklib a").css({
            "background-color": "#2E64FE", //blue
            "border-color": "#0040FF"
        });
    }

    setTimeout(function() {
        setRtklibIconColor();
    }, 1000);
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
