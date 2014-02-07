var pathRtklib = 'tools\\rtklib\\rtknavi_mkl.exe';
var portRtklib = 8000;
var rtklibRunning = false;
var rtklibConnect = false;
// var rtklibChild = globalrtklibChild;


checkRtklib();
setStartStopBtnRtklib();

/**
 * checks if rtklib is running and tcp-server is started
 * @return nothing
 */
function checkRtklib() {
    setRtklibIconColor();
    var net = require('net');
    var client = net.connect({
            port: portRtklib
        },
        function() { //'connect' listener
            // rtklibRunning = true;
            setRtklibIconColor();
            // console.log('rtklib connected');
        });
    client.on('data', function(data) {
        rtklibConnect = true;
        setRtklibIconColor();
        client.end();
    });
    client.on('end', function() {
        try {
            console.log('rtklib disconnected');
        } catch (e) {}
        rtklibConnect = false;
        setRtklibIconColor();
    });
    client.on('error', function() {
        try {
            console.log('rtklib running but server not started');
        } catch (e) {}

        rtklibConnect = false;
        setRtklibIconColor();
    });
}

/**
 * starts rtklib in a new child
 * @return nothing
 */
function startRtklib() {
    if (global.rtklibChild === undefined) {
        var spawn = require('child_process').execFile;
        global.rtklibChild = spawn(pathRtklib, [], [], function() {});
        // rtklibChild = globalrtklibChild;
        global.rtklibChild.on('error', function(code) {
            setRtklibIconColor();
            console.log('error on starting rtklib ' + code);
        });

        global.rtklibChild.on('exit', function(code) {
            //makes troubles when site is reloaded and rtklib is then closed!!!
            //looks like console is then null
            try {
                console.log('rtklib process exited with code ' + code);
            } catch (e) {}
            global.rtklibChild = undefined;
            setRtklibIconColor();


        });

    }
}

/**
 * kills rtklib child process
 * @return nothing
 */
function stopRtklib() {
    if (global.rtklibChild !== undefined) {
        global.rtklibChild.kill();
    }
}

/**
 * adds click funtionality to the rtklib start/stop-button
 */
function setStartStopBtnRtklib() {
    $(".startRtklib a").click(function() {
        if (global.rtklibChild !== undefined) {
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
    if (global.rtklibChild === undefined) {
        $(".startRtklib a").css({
            "background-color": "#FE2E2E", //red
            "border-color": "#FF0000"
        });
    }
    if (global.rtklibChild !== undefined && !rtklibConnect) {
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
