var HOST = '192.168.1.104';
var initMap = true;


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
    createWMSLayer();
    createPOIVectorLayer();
    createPositionVectorLayer();
    addMapCtrl();

    global.map.zoomToMaxExtent();

})();


/**
 * creates Vector-Layer and sets style
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
 * creates WMS-Layer and sets center to home-position and zooms in
 * @return nothing
 */

function createWMSLayer() {
    var wmsLayer = new OpenLayers.Layer.WMS("Karte Österreich", "http://" + HOST + ":8080/service", {
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
    wmsLayer.events.register('loadend', this, function() {
        if (initMap) {
            setHomeCenter();
            initMap = false;
        }
    });
    global.map.addLayer(wmsLayer);
}

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
    global.map_layer_pos_vector = new OpenLayers.Layer.Vector("Position", {
        styleMap: position_vector_style_map
        // isBaseLayer: true
    });
    global.map.addLayer(global.map_layer_pos_vector);

    if (global.map_point_currentPositionLineString === undefined) {
        global.map_point_currentPositionLineString = new OpenLayers.Geometry.LineString();
    }
    
    global.map_layer_pos_vector.addFeatures([new OpenLayers.Feature.Vector(global.map_point_currentPositionLineString)]);
}

function addMapCtrl() {
    global.map.addControl(new OpenLayers.Control.LayerSwitcher());
}

function createCurrentDriveLineVectorLayer() {

}

function setDrawCurrentPosition(pos) {
    // global.console.log('pos');
    var newpoint = new OpenLayers.Geometry.Point(pos.lon, pos.lat).transform(new OpenLayers.Projection('EPSG:4326'), new OpenLayers.Projection('EPSG:31287'));
    var realpoint = newpoint;

    global.map_point_currentPositionLineString.addPoint(realpoint);

    if (global.map_point_currentPositionLineString.components.length > 1000) {
        global.map_point_currentPositionLineString.removePoint(global.map_point_currentPositionLineString.components[0]);
    }

    global.map_layer_pos_vector.redraw();
    setMapCenter(realpoint);
}

function setMapCenter(positionPoint) {
    // global.console.log('center');
    var zoomLevel = 11;
    if (!initMap) {
        zoomLevel = global.map.getZoom();
    }
    var centerPoint = new OpenLayers.LonLat(positionPoint.x, positionPoint.y);
    global.map.setCenter(centerPoint, zoomLevel);
}

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
