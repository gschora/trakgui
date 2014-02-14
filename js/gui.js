(function() {
    setupGuiElements();
    global.win.on('resize', setPositionOnResize);
    setPositionOnResize();
    setupAutoCenterToogleBtn();
})();



function setPositionOnResize() {
    var ctrlPos = global.win.width - 110;
    var mapWidth = global.win.width - 62;
    var mapHeight = global.win.height - 85;
    $('#settings').css('left', ctrlPos);
    $('#page').css('width', mapWidth);
    $('#map').css('height', mapHeight);
}

function setupGuiElements() {
    styleMapFooterBtn();
}

function styleMapFooterBtn() {
    $('.footerBtn').addClass("ui-button ui-widget ui-state-default ui-button-text-only");
    $('.footerBtn').hover(function() {
        $('.footerBtn').addClass("ui-state-hover");
    }, function() {
        $('.footerBtn').removeClass("ui-state-hover");
    });
}

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
