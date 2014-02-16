var HOST = '192.168.1.104';
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
    createLineGridVectorLayer();
    addMapCtrl();

    global.map.zoomToMaxExtent();

})();

/**
 * creates the Base-Vector-Layer, without it, toogleVisibility of WMS won't work
 * @return {[type]} [description]
 */

function createBaseVectorLayer() {
    var base_vector_layer = new OpenLayers.Layer.Vector("Base", {
        isBaseLayer: true
    });
    global.map.addLayer(base_vector_layer);
}

/**
 * creates WMS-Layer and sets center to home-position and zooms in
 * @return nothing
 */

function createWMSLayer() {
    global.map_layer_wms = new OpenLayers.Layer.WMS("Karte Österreich", "http://" + HOST + ":8080/service", {
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
    global.map_layer_wms.events.register('loadend', this, function() {
        if (!global.mapShowWMS) {
            global.map_layer_wms.setVisibility(false);
        }
        if (initMap) {
            setHomeCenter();
            initMap = false;
        }

    });
    global.map.addLayer(global.map_layer_wms);

}

/**
 * creates Point-Of-Interrest Vector-Layer and sets style
 * @return nothing
 */

function createPOIVectorLayer() {
    // Vektorlayer und toolbar mit den zeichenwerkzeugen
    global.map_layer_poi_vector = new OpenLayers.Layer.Vector('poi', {
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
    global.map_layer_poi_vector.styleMap = vector_style_map;
    global.map.addLayer(global.map_layer_poi_vector);

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
    global.map_layer_vector_pos = new OpenLayers.Layer.Vector("Position", {
        styleMap: position_vector_style_map
        // isBaseLayer: true
    });
    global.map.addLayer(global.map_layer_vector_pos);

    if (global.map_point_currentPositionLineString === undefined) {
        global.map_point_currentPositionLineString = new OpenLayers.Geometry.LineString();
    }

    global.map_layer_vector_pos.addFeatures([new OpenLayers.Feature.Vector(global.map_point_currentPositionLineString)]);
}

function createLineGridVectorLayer() {
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
    global.map_layer_vector_linegrid = new OpenLayers.Layer.Vector("Line", {
        styleMap: line_grid_vector_style_map
        // dx : 0.000001,
        // dy : 0.000001
    });
    global.map.addLayer(global.map_layer_vector_linegrid);
}

/**
 * adds controls to map
 * x Layerswitcher
 */

function addMapCtrl() {
    global.map.addControl(new OpenLayers.Control.LayerSwitcher());
}

function createCurrentDriveLineVectorLayer() {

}

/**
 * adds current position to linestring on vector-layer and redraws that layer
 * @param {position} pos position from processor.js
 */

function setDrawCurrentPosition(pos) {
    // global.console.log('pos');
    var newpoint = new OpenLayers.Geometry.Point(pos.lon, pos.lat).transform(new OpenLayers.Projection('EPSG:4326'), new OpenLayers.Projection('EPSG:31287'));
    var realpoint = newpoint;

    global.map_point_currentPositionLineString.addPoint(realpoint);

    if (global.map_point_currentPositionLineString.components.length > 100) {
        global.map_point_currentPositionLineString.removePoint(global.map_point_currentPositionLineString.components[0]);
    }

    global.map_layer_vector_pos.redraw();
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
    if (global.mapAutoCenter) {
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
        global.map_layer_poi_vector.addFeatures([newFeaturePoint]);
    }

    setMapCenter(homePoint);
}
