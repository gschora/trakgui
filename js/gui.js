(function() {
    setupGuiElements();
    global.win.on('resize', setPositionOnResize);
})();


/**
 * sets position on various gui elements on window resizing
 */

function setPositionOnResize() {
    var ctrlPos = global.win.width - 110;
    var mapWidth = global.win.width - 62;
    var mapHeight = global.win.height - 85;
    $('#settings').css('left', ctrlPos);
    $('#page').css('width', mapWidth);
    $('#map').css('height', mapHeight);
}

/**
 * sets up various gui elements
 */

function setupGuiElements() {
    styleBtnMapFooter();
    setPositionOnResize();
    setupBtnToogleMapAutoCenter();
    setupBtnToogleMapShowWMS();
    setupBtnGpsUseCompass()
    setupBtnSetDriveLineManual();
}

/**
 * updates the status in the header with status(fix|float|single), #sat, lat and lon
 * @param  {Position} pos position from processor.js
 */

function updateStatusHeader(pos) {
    switch (parseInt(pos.status)) {
        case 1:
            $('#statusHeader_status').html("<span>fix</span>").addClass('green');
            $('#statusHeader_status').removeClass('red');
            $('#statusHeader_status').removeClass('yellow');
            $('#statusHeader_status').removeClass('white');
            break;
        case 2:
            $('#statusHeader_status').html("<span>float</span>").addClass('yellow');
            $('#statusHeader_status').removeClass('red');
            $('#statusHeader_status').removeClass('green');
            $('#statusHeader_status').removeClass('white');
            break;
        case 5:
            $('#statusHeader_status').html("<span>single</span>").addClass('red');
            $('#statusHeader_status').removeClass('green');
            $('#statusHeader_status').removeClass('yellow');
            $('#statusHeader_status').removeClass('white');
            break;
        default:
            $('#statusHeader_status').html("<span>noStat</span>").addClass('white');
            $('#statusHeader_status').removeClass('green');
            $('#statusHeader_status').removeClass('yellow');
            $('#statusHeader_status').removeClass('red');
            break;
    }

    $('#statusHeader_sat').html(pos.numSat);
    $('#statusHeader_lat').html(pos.lat);
    $('#statusHeader_lon').html(pos.lon);
}

/**
 * styles the footer buttons of the map and adds hover effects
 */

function styleBtnMapFooter() {
    $('.footerBtn').addClass("ui-button ui-widget ui-state-default ui-button-text-only");
    $('.footerBtn').hover(function() {
        $(this).addClass("ui-state-hover");
    }, function() {
        $(this).removeClass("ui-state-hover");
    });
}

/**
 * sets up autocenterToogle-Button function
 */

function setupBtnToogleMapAutoCenter() {
    if (global.cfg.mapAutoCenter) {
        $('#btnToogleMapAutoCenter').addClass("ui-state-active");
    } else {
        $('#btnToogleMapAutoCenter').removeClass("ui-state-active");
    }

    $('#btnToogleMapAutoCenter').click(function() {
            if (global.cfg.mapAutoCenter) {
                $('#btnToogleMapAutoCenter').removeClass("ui-state-active");
                global.cfg.mapAutoCenter = false;
            } else {
                $('#btnToogleMapAutoCenter').addClass("ui-state-active");
                global.cfg.mapAutoCenter = true;
            }

        }

    );
}

/**
 * sets up the showWMSToogle-Button functions
 */

function setupBtnToogleMapShowWMS() {
    if (global.cfg.mapShowWMSLayer) {
        $('#btnToogleMapShowWMS').addClass("ui-state-active");
    } else {
        $('#btnToogleMapShowWMS').removeClass("ui-state-active");
    }

    $('#btnToogleMapShowWMS').click(function() {
            if (global.mapLayers.wms.visibility) {
                $('#btnToogleMapShowWMS').removeClass("ui-state-active");
                global.mapLayers.wms.setVisibility(false);
                global.cfg.mapShowWMSLayer = false;
            } else {
                $('#btnToogleMapShowWMS').addClass("ui-state-active");
                global.mapLayers.wms.setVisibility(true);
                global.cfg.mapShowWMSLayer = true;
            }

        }

    );
}

/**
 * sets up the UseCompass-Button functions
 */

function setupBtnGpsUseCompass() {
    if (global.cfg.gpsUseCompass) {
        $('#btnGpsUseCompass').addClass("ui-state-active");
    } else {
        $('#btnGpsUseCompass').removeClass("ui-state-active");
    }

    $('#btnGpsUseCompass').click(function() {
            if (global.cfg.gpsUseCompass) {
                $('#btnGpsUseCompass').removeClass("ui-state-active");
                global.mapLayers.vector_compass.setVisibility(false);
                global.cfg.gpsUseCompass = false;
            } else {
                $('#btnGpsUseCompass').addClass("ui-state-active");
                global.mapLayers.vector_compass.setVisibility(true)
                global.cfg.gpsUseCompass = true;
            }

        }

    );
}

function setupBtnSetDriveLineManual() {



    $('#btnDriveLineManual').click(function() {
        var featureCtrl = global.map.getControlsBy("displayClass", "olControlDrawFeature")[0];
        if (!featureCtrl.active || featureCtrl === null) {
            featureCtrl.activate();
        } else {
            featureCtrl.deactivate();
        }
    });
}
