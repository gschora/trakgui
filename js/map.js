var initMap = true;
var zoomLevel = 11;

/**
 * auto sets up the map on the site
 * @return nothing
 */
(function setupMap() {
    global.map = new OpenLayers.Map({
        div: "map",
        projection: new OpenLayers.Projection('EPSG:31287'),
        units: 'm',
        displayProjection: new OpenLayers.Projection("EPSG:4326"),
        // controls: map_controls,
        // maxResolution : 360/512,
        maxResolution: 'auto',
        allOverlays: true,
        maxExtent: new OpenLayers.Bounds(107778.5323, 286080.6331, 694883.9348, 575953.6150) //siehe http://spatialreference.org/ref/epsg/31287/
    });
    createBaseVectorLayer();
    createWMSLayer();
    createPOIVectorLayer();
    createPositionVectorLayer();
    createDriveLineVectorLayer();
    createCompassVectorLayer();
    addMapCtrl();

    global.map.zoomToMaxExtent();

})();

/**
 * creates the Base-Vector-Layer, without it, toogleVisibility of WMS won't work
 * @return {[type]} [description]
 */

function createBaseVectorLayer() {
    global.mapLayers.vector_base = new OpenLayers.Layer.Vector("Base", {
        isBaseLayer: true
    });
    global.map.addLayer(global.mapLayers.vector_base);
}

/**
 * creates WMS-Layer and sets center to home-position and zooms in
 * @return nothing
 */

function createWMSLayer() {
    global.mapLayers.wms = new OpenLayers.Layer.WMS("Karte Österreich", "http://" + global.cfg.mapProxyHost + ":" + global.cfg.mapProxyHostPort + "/service", {
        layers: 'ortho',
        // isBaseLayer: false,
        format: 'image/jpeg' //jpeg besser für rasterdaten
    }, {
        singleTile: false,
        buffer: 1,
        // isBaseLayer: false,
        ratio: 1

    });
    // sets center of map to home-position and zooms in
    global.mapLayers.wms.events.register('loadend', this, function() {
        if (!global.cfg.mapShowWMSLayer) {
            global.mapLayers.wms.setVisibility(false);
        }
        if (initMap) {
            setHomeCenter();
            initMap = false;
        }

    });
    global.map.addLayer(global.mapLayers.wms);

}

/**
 * creates Point-Of-Interrest Vector-Layer and sets style
 * @return nothing
 */

function createPOIVectorLayer() {
    // Vektorlayer und toolbar mit den zeichenwerkzeugen
    global.mapLayers.vector_poi = new OpenLayers.Layer.Vector('poi', {
        renderers: ['Canvas', 'SVG', 'VML'],
        projection: new OpenLayers.Projection('EPSG:31287')
        // isBaseLayer: false

    });
    // map.addControl(new OpenLayers.Control.EditingToolbar(vector_layer));

    // die Farbe der Punkte beim zeichnen auf rot setzen und nur 1px gross machen...
    var vector_style = new OpenLayers.Style({
        fillColor: '#FF8000',
        fillOpacity: 0.4,
        strokeColor: '#FF0000',
        strokeWidth: 2,
        pointRadius: 5
    });
    vector_style_map = new OpenLayers.StyleMap({
        'default': vector_style
    });
    global.mapLayers.vector_poi.styleMap = vector_style_map;
    global.map.addLayer(global.mapLayers.vector_poi);

}

/**
 * creates Current Position vector layer
 * @return nothing
 */

function createPositionVectorLayer() {
    var position_vector_style_normal = new OpenLayers.Style({
        fillColor: '#2E9AFE',
        fillOpacity: 0.4,
        strokeColor: '#2E9AFE',
        strokeWidth: 5,
        pointRadius: 2
    });
    var position_vector_style_temp = new OpenLayers.Style({
        fillColor: '${statusFillColor}',
        fillOpacity: 0.4,
        strokeColor: '${statusStrokeColor}',
        strokeWidth: 1,
        pointRadius: 2
    });
    var position_vector_style_map = new OpenLayers.StyleMap({
        'default': position_vector_style_normal,
        'temporary': position_vector_style_temp
    });
    global.mapLayers.vector_pos = new OpenLayers.Layer.Vector("Position", {
        styleMap: position_vector_style_map
        // isBaseLayer: true
    });
    global.map.addLayer(global.mapLayers.vector_pos);

    if (global.mapFeatures.line_currentPosition === undefined) {
        global.mapFeatures.line_currentPosition = new OpenLayers.Geometry.LineString();
    }

    global.mapLayers.vector_pos.addFeatures([new OpenLayers.Feature.Vector(global.mapFeatures.line_currentPosition)]);
}

function createDriveLineVectorLayer() {
    var line_grid_style_normal = new OpenLayers.Style({
        fillColor: '#DF7401',
        fillOpacity: 0.4,
        strokeColor: '#DF7401',
        strokeWidth: 1,
        pointRadius: 2
    });
    var line_grid_vector_style_map = new OpenLayers.StyleMap({
        'default': line_grid_style_normal
    });
    global.mapLayers.vector_driveLine = new OpenLayers.Layer.Vector("Line", {
        styleMap: line_grid_vector_style_map,
        projection: new OpenLayers.Projection('EPSG:31287')
        // dx : 0.000001,
        // dy : 0.000001
    });

    global.map.addLayer(global.mapLayers.vector_driveLine);

    if (global.mapFeatures.line_driveLine === undefined) {
        global.mapFeatures.line_driveLine = new OpenLayers.Geometry.LineString();
    }
    global.mapFeatures.vector_helpPointLeft = new OpenLayers.Feature.Vector(global.mapFeatures.point_helpPointLeft);
    global.mapFeatures.vector_helpPointLeft.fid = "vector_helpPointLeft";
    global.mapFeatures.vector_helpPointRight = new OpenLayers.Feature.Vector(global.mapFeatures.point_helpPointRight);
    global.mapFeatures.vector_helpPointRight.fid = "vector_helpPointRight";

    global.mapLayers.vector_driveLine.addFeatures([new OpenLayers.Feature.Vector(global.mapFeatures.line_driveLine), global.mapFeatures.vector_helpPointLeft, global.mapFeatures.vector_helpPointRight]);
    // adds other drivelines
    addDriveLineLists();

}

function createCompassVectorLayer() {
    var compass_style = new OpenLayers.Style({
        strokeColor: '#DF0101',
        strokeWidth: 1
    });
    var compass_vector_style_map = new OpenLayers.StyleMap({
        'default': compass_style
    });
    global.mapLayers.vector_compass = new OpenLayers.Layer.Vector("Compass", {
        projection: new OpenLayers.Projection('EPSG:31287'),
        styleMap: compass_vector_style_map
    });
    global.map.addLayer(global.mapLayers.vector_compass);

    if (!global.cfg.gpsUseCompass) {
        global.mapLayers.vector_compass.setVisibility(false);
    }

    if (global.mapFeatures.line_compass === undefined) {
        global.mapFeatures.line_compass = new OpenLayers.Geometry.LineString([new OpenLayers.Geometry.Point(0, -global.cfg.compassLineLength), new OpenLayers.Geometry.Point(0, global.cfg.compassLineLength)]);
    }
    global.mapLayers.vector_compass.addFeatures([new OpenLayers.Feature.Vector(global.mapFeatures.line_compass)]);
}

/**
 * adds controls to map
 * x Layerswitcher
 */

function addMapCtrl() {
    global.map.addControl(new OpenLayers.Control.LayerSwitcher());
    var drawFeatureCtrl = new OpenLayers.Control.DrawFeature(global.mapLayers.vector_driveLine, OpenLayers.Handler.Point);
    drawFeatureCtrl.featureAdded = function(point) {
        setDriveLineStartStop(point);
    };

    global.map.addControl(drawFeatureCtrl);
}

/**
 * adds current position to linestring on vector-layer and redraws that layer, updates status header
 * @param {position} pos position from processor.js
 */

function drawCurrentPosition(pos) {
    var realpoint;
    var newpoint = new OpenLayers.Geometry.Point(pos.lon, pos.lat).transform(new OpenLayers.Projection('EPSG:4326'), new OpenLayers.Projection('EPSG:31287'));

    if (global.cfg.gpsUseCompass) {
        realpoint = getRealCoords(newpoint, pos.x_tilt, pos.y_tilt, global.cfg.imuAntennaHeight, pos.angle_compass);
    } else {
        realpoint = newpoint;
    }

    global.mapFeatures.line_currentPosition.addPoint(realpoint);

    if (global.mapFeatures.line_currentPosition.components.length > 100) {
        global.mapFeatures.line_currentPosition.removePoint(global.mapFeatures.line_currentPosition.components[0]);
    }

    moveCompassLine(realpoint, pos.angle_compass);

    global.mapLayers.vector_pos.redraw();
    updateStatusHeader(pos);
    setMapCenter(realpoint);
    getDriveLineSide(realpoint);
}

/**
 * sets the maps center to to a point
 * @param {penLayers.Geometry.Point} positionPoint point to where the center should be set
 */

function setMapCenter(positionPoint) {
    if (initMap) {
        global.map.zoomTo(zoomLevel);
        initMap = false;
    }
    if (global.cfg.mapAutoCenter) {
        var centerPoint = new OpenLayers.LonLat(positionPoint.x, positionPoint.y);
        global.map.setCenter(centerPoint);
    }
}

/**
 * centers map on home location
 */

function setHomeCenter() {
    // GROßS Problem mit transformation von punkten von einer Projektion in die andere: anscheinend muss die seite fertiggeladen sein damit das funktioniert
    // weil wenn ich dass gleich oben mache bei der init() funktion, dann funktionierts nicht!
    var homePoint = new OpenLayers.Geometry.Point(15.83540740866592, 47.34154140332728).transform(new OpenLayers.Projection('EPSG:4326'), new OpenLayers.Projection('EPSG:31287'));
    var newFeaturePoint = new OpenLayers.Feature.Vector(homePoint);
    if (initMap) {
        global.mapLayers.vector_poi.addFeatures([newFeaturePoint]);
    }

    setMapCenter(homePoint);
}

function getRealCoords(originPoint, x_tilt, y_tilt, antennaHeight, compass_angle) {
    var x_dist = calcAngleDist(x_tilt + global.cfg.imuAccelCalX, antennaHeight);
    var y_dist = calcAngleDist(y_tilt + global.cfg.imuAccelCalY, antennaHeight);
    var destPoint = originPoint.clone();
    // global.console.log(x_dist + "|" + y_dist + "|" + antennaHeight + "|" + compass_angle);
    destPoint.move(x_dist, y_dist);
    destPoint.rotate(360 - compass_angle, originPoint);

    return destPoint;
}

function calcAngleDist(angle, height) {
    // global.console.log(angle +"|"+height);
    return (Math.sin(angle * (Math.PI / 180)) * height); //Math.sin in JS ist in Radian deshalb die Formel mit Math.PI/180 multiplizieren!!!!
}

function moveCompassLine(destPoint, angle) {
    // global.console.log("a: "+angle);
    movePoint(global.mapFeatures.line_compass.components[0], destPoint, global.cfg.compassLineLength);
    movePoint(global.mapFeatures.line_compass.components[1], destPoint, -global.cfg.compassLineLength);

    global.mapFeatures.line_compass.rotate(360 - angle, global.mapFeatures.line_compass.getCentroid(true));
    global.mapLayers.vector_compass.redraw();

}

function movePoint(sourcePoint, destPoint, length) {
    // global.console.log("length: "+length);
    sourcePoint.x = destPoint.x;
    sourcePoint.y = destPoint.y + length;
    sourcePoint.clearBounds();
}

/**
 *------------------------------------------------------------------------------------------
 *                  drive lines
 *------------------------------------------------------------------------------------------
 */

function setDriveLineStartStop(point) {
    if (global.mapFeatures.point_startPoint === undefined) {
        // set startpoint
        global.mapFeatures.point_startPoint = point.geometry;

    } else if (global.mapFeatures.point_endPoint === undefined) {
        // if startpoint is set set the endpoint and create the driveline
        // 
        // clear all other features, points, lines
        global.mapLayers.vector_driveLine.removeAllFeatures();
        // sets new endpoint
        global.mapFeatures.point_endPoint = point.geometry;
        // global.console.log(global.mapFeatures.point_endPoint);
        if (global.mapFeatures.point_startPoint !== undefined) {
            // make new driveline
            global.mapFeatures.line_driveLine = new OpenLayers.Geometry.LineString([global.mapFeatures.point_startPoint, global.mapFeatures.point_endPoint]);
            // set driveline middle
            global.mapFeatures.driveLineListMiddle = global.mapFeatures.line_driveLine;
            // make new vector for the driveline
            global.mapFeatures.vector_driveLine = new OpenLayers.Feature.Vector(global.mapFeatures.line_driveLine);
            // add the feature to the layer
            global.mapLayers.vector_driveLine.addFeatures([global.mapFeatures.vector_driveLine]);
            // set driveline list side
            global.cfg.driveLineListSide = 0;
            global.cfg.driveLineListIndexCurrent = -1;
            // clear old drivelinelists
            global.mapFeatures.driveLineListLeft.length = 0;
            global.mapFeatures.driveLineListRight.length = 0;
            // creates helper points
            setDriveLine(global.mapFeatures.line_driveLine);
        }
    } else {
        // if the start-point and endpoint are set, asume this is the new startpoint and delete endpoint
        global.mapFeatures.point_startPoint = point.geometry;
        global.mapFeatures.point_endPoint = undefined;
    }
}

/**
 * creates helperpoints in the middle and 90deg from driveline
 * needed for calculating on which side of the driveline the position is
 * @param {OpenLayers.Geometry.LineString} line the actual driveline
 */

function setDriveLine(line) {
    global.mapFeatures.line_driveLine = line;
    var driveLineCenter = line.getCentroid(true);
    // here's a hack:
    // because after a windowreload, when it retrieves the linestring from "global", somehow the line.getCentroid(true) doesn't return a INSTANCEOF OpenLayers.Geometry.Point it gets stuck in a loop when you try to rotate a point in getting a radius at point.distanceTo() so we make a new point
    var driveLineOrigin = new OpenLayers.Geometry.Point(driveLineCenter.x, driveLineCenter.y);
    var driveLineAngle = getDriveLineAngle(line);

    // remove old helper-points from layer
    if (global.mapFeatures.point_helpPointLeft !== undefined) {
        global.mapLayers.vector_driveLine.removeFeatures([global.mapFeatures.vector_helpPointLeft]);
    }
    if (global.mapFeatures.point_helpPointRight !== undefined) {
        global.mapLayers.vector_driveLine.removeFeatures([global.mapFeatures.vector_helpPointRight]);
    }

    // create new helperpoints, set position to middle of driveline +- value
    global.mapFeatures.point_helpPointLeft = new OpenLayers.Geometry.Point(driveLineOrigin.x - 40, driveLineOrigin.y);
    global.mapFeatures.point_helpPointRight = new OpenLayers.Geometry.Point(driveLineOrigin.x + 40, driveLineOrigin.y);
    //rotate the helperpoints according to driveline-angle
    global.mapFeatures.point_helpPointLeft.rotate(-driveLineAngle, driveLineOrigin);
    global.mapFeatures.point_helpPointRight.rotate(-driveLineAngle, driveLineOrigin);

    // set helper-points in helper-vectors
    global.mapFeatures.vector_helpPointLeft.geometry = global.mapFeatures.point_helpPointLeft;
    global.mapFeatures.vector_helpPointRight.geometry = global.mapFeatures.point_helpPointRight;

    // add helper-points to layer
    global.mapLayers.vector_driveLine.addFeatures([global.mapFeatures.vector_helpPointLeft, global.mapFeatures.vector_helpPointRight]);

    global.mapLayers.vector_driveLine.redraw();
}


function addDriveLineLists() {
    // add middle driveline
    global.mapLayers.vector_driveLine.addFeatures(new OpenLayers.Feature.Vector(global.mapFeatures.driveLineListMiddle));
    // add left drivelines
    for (var i = 0, len = global.mapFeatures.driveLineListLeft.length; i < len; i++) {
        var itemLeft = global.mapFeatures.driveLineListLeft[i];
        global.mapLayers.vector_driveLine.addFeatures(new OpenLayers.Feature.Vector(itemLeft));
    }
    // add right drivelines
    for (var j = 0, le = global.mapFeatures.driveLineListRight.length; j < le; j++) {
        var itemRight = global.mapFeatures.driveLineListRight[j];
        global.mapLayers.vector_driveLine.addFeatures(new OpenLayers.Feature.Vector(itemRight));
    }
}

/**
 * checks if the distance from the helper-points is the same to the edge-points of the driveline
 * to see if the points are really
 * @return {[type]} [description]
 */

function checkDistance() {
    var distDiffA = global.mapFeatures.point_helpPointLeft.distanceTo(global.mapFeatures.line_driveLine.components[0]) - global.mapFeatures.point_helpPointRight.distanceTo(global.mapFeatures.line_driveLine.components[0]);
    var distDiffB = global.mapFeatures.point_helpPointLeft.distanceTo(global.mapFeatures.line_driveLine.components[1]) - global.mapFeatures.point_helpPointRight.distanceTo(global.mapFeatures.line_driveLine.components[1]);
    var lineAA = new OpenLayers.Geometry.LineString([global.mapFeatures.point_helpPointLeft, global.mapFeatures.line_driveLine.components[0]]);
    var lineAB = new OpenLayers.Geometry.LineString([global.mapFeatures.point_helpPointRight, global.mapFeatures.line_driveLine.components[0]]);
    var lineBA = new OpenLayers.Geometry.LineString([global.mapFeatures.point_helpPointLeft, global.mapFeatures.line_driveLine.components[1]]);
    var lineBB = new OpenLayers.Geometry.LineString([global.mapFeatures.point_helpPointRight, global.mapFeatures.line_driveLine.components[1]]);

    var distA = lineAA.getGeodesicLength('EPSG:31287') - lineAB.getGeodesicLength('EPSG:31287');
    var distB = lineBA.getGeodesicLength('EPSG:31287') - lineBB.getGeodesicLength('EPSG:31287');

    global.console.log("diff: " + distDiffA + "|" + distDiffB + "||geo: " + distA + "|" + distB);
}

function getDriveLineSide(positionPoint) {

    if (global.mapFeatures.point_helpPointLeft !== undefined && global.mapFeatures.point_helpPointRight !== undefined) {
        var distLineLeft = new OpenLayers.Geometry.LineString([global.mapFeatures.point_helpPointLeft, positionPoint]);
        var distLineRight = new OpenLayers.Geometry.LineString([global.mapFeatures.point_helpPointRight, positionPoint]);

        var distLeft = distLineLeft.getGeodesicLength('EPSG:31287');
        var distRight = distLineRight.getGeodesicLength('EPSG:31287');

        var sideDiff = distLeft - distRight;

        if (sideDiff > 0) {
            // global.console.log("left");
            return 0;
        } else if (sideDiff < 0) {
            // global.console.log("right");
            return 1;
        } else {
            // global.console.log("middle");
            return 2;
        }

        // global.console.log("dist:" + distLeft + "|" + distRight + "|" + sideDiff);
    }



}

function getDriveLineAngle(lineString) {

    // console.log(lineString);
    var sPoint = lineString.components[0];
    var ePoint = lineString.components[1];

    var a_x = ePoint.x - sPoint.x;
    var a_y = ePoint.y - sPoint.y;
    var b_x = 0;
    var b_y = 1;

    // a_x = seg.x2 - seg.x1;
    // a_y = seg.y2 - seg.y1;
    var angle_rad = Math.acos((a_x * b_x + a_y * b_y) / Math.sqrt(a_x * a_x + a_y * a_y));
    var angle = 360 / (2 * Math.PI) * angle_rad;
    if (a_x < 0) {
        return 360 - angle;
    } else {
        return angle;
    }
}

function moveDriveLineLeft(factor) {
    var spacing = global.cfg.driveLineMoveSpacing / factor;

    if (global.mapFeatures.line_driveLine !== undefined && global.mapFeatures.line_driveLine.components.length === 2) {
        var angle = getDriveLineAngle(global.mapFeatures.line_driveLine);
        // save old lines and points
        var oldLine = global.mapFeatures.line_driveLine.clone();
        // move points
        global.mapFeatures.line_driveLine.components[0].move(-spacing, 0);
        global.mapFeatures.line_driveLine.components[1].move(-spacing, 0);
        // rotate the points with rotating center of the old points 
        global.mapFeatures.line_driveLine.components[0].rotate(-angle, oldLine.components[0]);
        global.mapFeatures.line_driveLine.components[1].rotate(-angle, oldLine.components[1]);
        // resets helperpoints for moved driveline
        setDriveLine(global.mapFeatures.line_driveLine);
    }
}

function moveDriveLineRight(factor) {
    var spacing = global.cfg.driveLineMoveSpacing / factor;

    if (global.mapFeatures.line_driveLine !== undefined && global.mapFeatures.line_driveLine.components.length === 2) {
        var angle = getDriveLineAngle(global.mapFeatures.line_driveLine);
        // save old lines and points
        var oldLine = global.mapFeatures.line_driveLine.clone();
        // move points
        global.mapFeatures.line_driveLine.components[0].move(spacing, 0);
        global.mapFeatures.line_driveLine.components[1].move(spacing, 0);
        // rotate the points with rotating center of the old points 
        global.mapFeatures.line_driveLine.components[0].rotate(-angle, oldLine.components[0]);
        global.mapFeatures.line_driveLine.components[1].rotate(-angle, oldLine.components[1]);
        // resets helperpoints for moved driveline
        setDriveLine(global.mapFeatures.line_driveLine);
    }
}

function switchDriveLineLeft() {
    switch (global.cfg.driveLineListSide) {
        case 0:
            global.cfg.driveLineListSide = 1;
        case 1:
            global.cfg.driveLineListIndexCurrent++;
            if (global.cfg.driveLineListIndexCurrent >= global.mapFeatures.driveLineListLeft.length) {
                newDriveLineLeft();
            } else {
                setDriveLine(global.mapFeatures.driveLineListLeft[global.cfg.driveLineListIndexCurrent]);
            }
            break;
        case 2:
            global.cfg.driveLineListIndexCurrent--;
            if (global.cfg.driveLineListIndexCurrent < 0) {
                global.cfg.driveLineListSide = 0;
                setDriveLine(global.mapFeatures.driveLineListMiddle);
            } else {
                setDriveLine(global.mapFeatures.driveLineListRight[global.cfg.driveLineListIndexCurrent]);
            }
            break;
    }
    // global.console.log(global.cfg.driveLineListSide + "|" + global.cfg.driveLineListIndexCurrent);
}

function switchDriveLineRight() {
    switch (global.cfg.driveLineListSide) {
        case 0:
            global.cfg.driveLineListSide = 2;
        case 2:
            global.cfg.driveLineListIndexCurrent++;
            if (global.cfg.driveLineListIndexCurrent >= global.mapFeatures.driveLineListRight.length) {
                newDriveLineRight();
            } else {
                setDriveLine(global.mapFeatures.driveLineListRight[global.cfg.driveLineListIndexCurrent]);
            }
            break;
        case 1:
            global.cfg.driveLineListIndexCurrent--;
            if (global.cfg.driveLineListIndexCurrent < 0) {
                global.cfg.driveLineListSide = 0;
                setDriveLine(global.mapFeatures.driveLineListMiddle);
            } else {
                setDriveLine(global.mapFeatures.driveLineListLeft[global.cfg.driveLineListIndexCurrent]);
            }
            break;
    }
    // global.console.log(global.cfg.driveLineListSide + "|" + global.cfg.driveLineListIndexCurrent);
}

function newDriveLineLeft() {
    global.console.log("new line left");
    var driveLineLeft = global.mapFeatures.line_driveLine.clone();
    var spacing = global.cfg.driveLineSpacing / 100;
    var angle = getDriveLineAngle(driveLineLeft);

    driveLineLeft.components[0].move(-spacing, 0);
    driveLineLeft.components[1].move(-spacing, 0);
    driveLineLeft.components[0].rotate(-angle, global.mapFeatures.line_driveLine.components[0]);
    driveLineLeft.components[1].rotate(-angle, global.mapFeatures.line_driveLine.components[1]);

    global.mapFeatures.driveLineListLeft.push(driveLineLeft);
    global.cfg.driveLineListIndexCurrent = global.mapFeatures.driveLineListLeft.length - 1;

    global.mapLayers.vector_driveLine.addFeatures([new OpenLayers.Feature.Vector(driveLineLeft)]);

    setDriveLine(driveLineLeft);
}

function newDriveLineRight() {
    global.console.log("new line right");
    var driveLineRight = global.mapFeatures.line_driveLine.clone();
    var spacing = global.cfg.driveLineSpacing / 100;
    var angle = getDriveLineAngle(driveLineRight);

    driveLineRight.components[0].move(spacing, 0);
    driveLineRight.components[1].move(spacing, 0);
    driveLineRight.components[0].rotate(-angle, global.mapFeatures.line_driveLine.components[0]);
    driveLineRight.components[1].rotate(-angle, global.mapFeatures.line_driveLine.components[1]);

    global.mapFeatures.driveLineListRight.push(driveLineRight);
    global.cfg.driveLineListIndexCurrent = global.mapFeatures.driveLineListRight.length - 1;

    global.mapLayers.vector_driveLine.addFeatures([new OpenLayers.Feature.Vector(driveLineRight)]);
    setDriveLine(driveLineRight);
}
