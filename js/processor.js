function processData (data) {
    try {
        global.console.log(data.toString());




    } catch(e){}
    
}

// processRtklibPosition();

// function processRtklibPosition() {
//     if (global.childRtklib !== undefined && rtklibConnect) {
//         prcsPosClient = net.connect({
//                 port: global.cfgRtklibPort
//             },
//             function() { //'connect' listener
//                 // try {
//                 //     console.log('rtklib connected');
//                 // } catch (e) {}
//             });
//         prcsPosClient.on('data', function(data) {
//             convertData(data);
//             try {
//                 // console.log(data.toString());
//             } catch (e) {}

//             prcsPosClient.end();
//         });
//         prcsPosClient.on('error', function(code) {
//             try {
//                 console.log('error while trying to connect to rtklib: ' + code);
//             } catch (e) {}
//         });
//     }
//     // if (prcsPosClient === undefined) {
//     setTimeout(function() {
//         processRtklibPosition();
//     }, 2000);

// }

function convertData(data) {
    var monitor = data.toString().split("\n")[0].split(" ");
    // console.log(monitor);
    var pos = null;
    // console.log(angle_compass);

    if (monitor.length > 1) {
            var statNumSat = monitor[4].split(" ");
            if (statNumSat.length == 2){
                pos = {
                    "lat": monitor[1],
                    "lon": monitor[2],
                    "height": monitor[3],
                    "status": statNumSat[0],
                    "numSat": statNumSat[1],
                    "angle_compass": 0,
                    "pitch_compass": 0,
                    "roll_compass": 0,
                    "x_tilt": 0,
                    "y_tilt": 0
                }
            }else {
                pos = {
                    "lat": monitor[1],
                    "lon": monitor[2],
                    "height": monitor[3],
                    "status": monitor[4],
                    "numSat": monitor[5],
                    "angle_compass":0,// angle_compass,
                    "pitch_compass":0,// pitch_compass,
                    "roll_compass": 0,//roll_compass,
                    "x_tilt":0,// y_tilt,
                    "y_tilt":0// x_tilt
                }
            }
        console.info(pos);
        return pos;
    }
    return null;

}
