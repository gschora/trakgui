// module.exports = {
//     convdata: function(data) {
//         return convertData(data.toString());
//     }
// };

function processRtklibData(data) {
    try {
        if (data.length > 1) {
            var currentRtklibPos = convertData(data);
            // global.console.log("process");
            setDrawCurrentPosition(currentRtklibPos); //map.js
        }
        
        // global.console.log(currentRtklibPos);

    } catch (e) {}

}

/**
 * converts rtklib monitor output into object
 * @param  {String} data [rtklib monitor output-string]
 * @return {Position} pos
 * monitor[0] = date yyyy/mm/dd
 * monitor[1] = time hh:mm:ss.ssss
 * monitor[2] = latitude ddd.ddddddddd
 * monitor[3] = longitude ddd.ddddddddd
 * monitor[4] = height in m
 * monitor[5] = status quality 1 = fixed, 2 = float, 5 = single
 * monitor[6] = number of satelites
 * monitor[7] = standard deviation in m
 * 
 */
function convertData(data) {
    if (data.toString().length > 1) {
        var monitor = data.toString().trim().replace(/\s+/g, ",").split(",");
        var pos = {
            "lat": parseFloat(monitor[2]).toPrecision(11),
            "lon": parseFloat(monitor[3]).toPrecision(11),
            "height": parseFloat(monitor[4]),
            "status": parseInt(monitor[5]),
            "numSat": parseInt(monitor[6]),
            "angle_compass": 0, //angle_compass,
            "pitch_compass": 0, //pitch_compass,
            "roll_compass": 0, //roll_compass,
            "x_tilt": 0, //x_tilt,
            "y_tilt": 0 //y_tilt
        };
        return pos;
    }
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
