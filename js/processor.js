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
            drawCurrentPosition(currentRtklibPos); //map.js
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
        var sensorData = getSensorData(false);// sensor.js
        var monitor = data.toString().trim().replace(/\s+/g, ",").split(",");
        var pos = {
            "lat": parseFloat(monitor[2]).toPrecision(11),
            "lon": parseFloat(monitor[3]).toPrecision(11),
            "height": parseFloat(monitor[4]),
            "status": parseInt(monitor[5]),
            "numSat": parseInt(monitor[6]),
            "angle_compass": parseFloat(sensorData.angle_compass), //angle_compass,
            "pitch_compass": parseFloat(sensorData.pitch_compass), //pitch_compass,
            "roll_compass": parseFloat(sensorData.roll_compass), //roll_compass,
            "x_tilt": parseFloat(sensorData.x_tilt), //x_tilt,
            "y_tilt": parseFloat(sensorData.y_tilt) //y_tilt
        };
        return pos;
    }
}
