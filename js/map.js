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
        renderers: ['Canvas', 'SVG', 'VML']
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
        styleMap: line_grid_vector_style_map
        // dx : 0.000001,
        // dy : 0.000001
    });

    global.map.addLayer(global.mapLayers.vector_driveLine);

    if (global.mapFeatures.line_driveLine === undefined) {
        global.mapFeatures.line_driveLine = new OpenLayers.Geometry.LineString();
    }

    global.mapLayers.vector_driveLine.addFeatures([new OpenLayers.Feature.Vector(global.mapFeatures.line_driveLine)]);
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
        styleMap: compass_vector_style_map
    });
    global.map.addLayer(global.mapLayers.vector_compass);

    if (!global.cfg.gpsUseCompass) {
        global.mapLayers.vector_compass.setVisibility(false);
    }

    global.mapFeatures.line_compass = new OpenLayers.Geometry.LineString([new OpenLayers.Geometry.Point(0, 0), new OpenLayers.Geometry.Point(0, 40)]);
    global.mapLayers.vector_compass.addFeatures([new OpenLayers.Feature.Vector(global.mapFeatures.line_compass)]);
}

/**
 * adds controls to map
 * x Layerswitcher
 */

function addMapCtrl() {
    global.map.addControl(new OpenLayers.Control.LayerSwitcher());
    var drawFeatureCtrl = new OpenLayers.Control.DrawFeature(global.mapLayers.vector_driveLine, OpenLayers.Handler.Point);
    drawFeatureCtrl.featureAdded =function (point) {
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
    // global.console.log("useComp: " + global.cfg.gpsUseCompass);
    if (global.cfg.gpsUseCompass) {
        realpoint = getRealCoords(newpoint, pos.x_tilt, pos.y_tilt, global.cfg.imuAntennaHeight, pos.angle_compass);
        // pos.lat = realpoint.transform(new OpenLayers.Projection('EPSG:31287'), new OpenLayers.Projection('EPSG:4326')).x;
        // pos.lon = realpoint.transform(new OpenLayers.Projection('EPSG:31287'), new OpenLayers.Projection('EPSG:4326')).y;

    } else {
        realpoint = newpoint;
    }

    global.mapFeatures.line_currentPosition.addPoint(realpoint);

    if (global.mapFeatures.line_currentPosition.components.length > 10) {
        global.mapFeatures.line_currentPosition.removePoint(global.mapFeatures.line_currentPosition.components[0]);
    }


    // global.console.log("lat:"+pos.lat);

    moveCompassLine(realpoint, pos.angle_compass);
    // moveCompassLine(realpoint,parseInt(Math.random() * 90));

    global.mapLayers.vector_pos.redraw();
    updateStatusHeader(pos);
    setMapCenter(realpoint);
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
    movePoint(global.mapFeatures.line_compass.components[0], destPoint, -global.cfg.compassLineLength);
    movePoint(global.mapFeatures.line_compass.components[1], destPoint, global.cfg.compassLineLength);

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
        global.console.log("1");
        // set startpoint
        global.mapFeatures.point_startPoint = point.geometry;

    } else if (global.mapFeatures.point_endPoint === undefined) {
        global.console.log("2");
        // clear all other features, points, lines
        global.mapLayers.vector_driveLine.removeAllFeatures();
        // sets new endpoint
        global.mapFeatures.point_endPoint = point.geometry;
        // global.console.log(global.mapFeatures.point_endPoint);
        if (global.mapFeatures.point_startPoint !== undefined) {
            // make new driveline
            global.mapFeatures.line_driveLine = new OpenLayers.Geometry.LineString([global.mapFeatures.point_startPoint, global.mapFeatures.point_endPoint]);
            global.mapLayers.vector_driveLine.addFeatures([new OpenLayers.Feature.Vector(global.mapFeatures.line_driveLine)]);

            setDriveLine(global.mapFeatures.line_driveLine);
        }
    } else {
        global.console.log("3");

        global.mapFeatures.point_startPoint = point.geometry;
        global.mapFeatures.point_endPoint = undefined;
    }

}

function setDriveLine(line) {
    global.mapFeatures.line_driveLineCurrent = line;
    var origin = line.getCentroid(true);
    var driveLineAngle = getDriveLineAngle(line);

    global.console.log("angel: " + driveLineAngle);

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
