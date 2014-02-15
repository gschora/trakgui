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
    styleMapFooterBtn();
    setPositionOnResize();
    setupAutoCenterToogleBtn();
    setupShowWMSToogleBtn();
}

/**
 * updates the status in the header with status(fix|float|single), #sat, lat and lon
 * @param  {Position} pos position from processor.js
 */

function updateStatusHeader(pos) {
    switch (parseInt(pos.status)) {
        case 1:
            $('#statusHeader_status').html("fix").addClass('green');
            $('#statusHeader_status').removeClass('red');
            $('#statusHeader_status').removeClass('yellow');
            break;
        case 2:
            $('#statusHeader_status').html("float").addClass('yellow');
            $('#statusHeader_status').removeClass('red');
            $('#statusHeader_status').removeClass('green');
            break;
        case 5:
            $('#statusHeader_status').html("single").addClass('red');
            $('#statusHeader_status').removeClass('green');
            $('#statusHeader_status').removeClass('yellow');
            break;
    }

    $('#statusHeader_sat').html(pos.numSat);
    $('#statusHeader_lat').html(pos.lat);
    $('#statusHeader_lon').html(pos.lon);
}

/**
 * styles the footer buttons of the map and adds hover effects
 */

function styleMapFooterBtn() {
    $('.footerBtn').addClass("ui-button ui-widget ui-state-default ui-button-text-only");
    $('.footerBtn').hover(function() {
        $('.footerBtn').addClass("ui-state-hover");
    }, function() {
        $('.footerBtn').removeClass("ui-state-hover");
    });
}

/**
 * sets up autocenterToogle-Button function
 */

function setupAutoCenterToogleBtn() {
    if (global.mapAutoCenter) {
        $('#toogleMapAutoCenterBtn').addClass("ui-state-active");
    } else {
        $('#toogleMapAutoCenterBtn').removeClass("ui-state-active");
    }

    $('#toogleMapAutoCenterBtn').click(function() {
            if (global.mapAutoCenter) {
                $('#toogleMapAutoCenterBtn').removeClass("ui-state-active");
                global.mapAutoCenter = false;
            } else {
                $('#toogleMapAutoCenterBtn').addClass("ui-state-active");
                global.mapAutoCenter = true;
            }

        }

    );
}

/**
 * sets up the showWMSToogle-Button functions
 */

function setupShowWMSToogleBtn() {
    if (global.mapShowWMS) {
        $('#toogleMapViewWMSBtn').addClass("ui-state-active");
    } else {
        $('#toogleMapViewWMSBtn').removeClass("ui-state-active");
    }

    $('#toogleMapViewWMSBtn').click(function() {
            if (global.mapShowWMS) {
                $('#toogleMapViewWMSBtn').removeClass("ui-state-active");
                global.map_layer_wms.setVisibility(false);
                global.mapShowWMS = false;
            } else {
                $('#toogleMapViewWMSBtn').addClass("ui-state-active");
                global.map_layer_wms.setVisibility(true);
                global.mapShowWMS = true;
            }

        }

    );
}
