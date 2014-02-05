var HOST = '192.168.1.104';
var initMap = true;
var map = undefined;



/**
 * auto sets up the map on the site
 * @return nothing
 */
(function setupMap() {
    map = new OpenLayers.Map({
        div: "map",
        projection: new OpenLayers.Projection('EPSG:31287'),
        units: 'm',
        displayProjection: new OpenLayers.Projection("EPSG:4326"),
        // controls: map_controls,
        // maxResolution : 360/512,
        maxResolution: 'auto',
        // allOverlays: true,
        maxExtent: new OpenLayers.Bounds(107778.5323, 286080.6331, 694883.9348, 575953.6150) //siehe http://spatialreference.org/ref/epsg/31287/
    });
    createWMSLayer();
    createVectorLayer();
    map.zoomToMaxExtent();
})();


/**
 * creates Vector-Layer and sets style
 * @return nothing
 */
function createVectorLayer() {
    // Vektorlayer und toolbar mit den zeichenwerkzeugen
    var vector_layer = new OpenLayers.Layer.Vector('vectorLayer', {
        renderers: ['Canvas', 'SVG', 'VML']

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
    vector_layer.styleMap = vector_style_map;

    map.addLayer(vector_layer);
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
        ratio: 1
    });

    // sets center of map to home-position and zooms in
    wmsLayer.events.register('loadend', this, function() {
        if (initMap) {
            // GROßS Problem mit transformation von punkten von einer Projektion in die andere: anscheinend muss die seite fertiggeladen sein damit das funktioniert
            // weil wenn ich dass gleich oben mache bei der init() funktion, dann funktionierts nicht!
            var newpoint = new OpenLayers.Geometry.Point(15.83540740866592, 47.34154140332728).transform(new OpenLayers.Projection('EPSG:4326'), new OpenLayers.Projection('EPSG:31287'));
            var newFeaturePoint = new OpenLayers.Feature.Vector(newpoint);
            map.layers[1].addFeatures([newFeaturePoint]);
            var centerPoint = new OpenLayers.LonLat(newpoint.x, newpoint.y);
            map.setCenter(centerPoint, 11);
            initMap = false;
        }
    });

    map.addLayer(wmsLayer);
}
