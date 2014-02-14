var gui = require('nw.gui');
/**
 * starts all functions in die file
 * @return nothing
 */
(function() {
    autoReloadPage();
    // setupMenu();
    setupCfg();
    setupGuiElements();
})();

function setupCfg() {
    global.win = gui.Window.get();
    global.pageReloaded = true;

    global.cfgDebug = false;

    // console.log('setup_cfg');
    global.cfgRtklibPath = 'tools\\rtklib\\rtknavi_mkl.exe';
    global.cfgRtklibPort = 8000;
    global.cfgRtklibMonitorPort = 52001;
    global.cfgRtklibArgs = [];
    global.cfgRtklibStatus = 0; //0 = not running, 1 = running but not started, 2 = tcp-server started


    setPositionOnResize();
}


/**
 * auto reloads page in node-webkit everytime something is changed
 * @return nothing
 */

function autoReloadPage() {
    var fs = require('fs');

    fs.watch('./', [], function() {
        if (location)
            location.reload(false);
    });
}

/**
 * sets up native Menu in node-webkit
 * @return nothing
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

global.win.on('resize', setPositionOnResize);

function setPositionOnResize () {
    var ctrlPos = global.win.width - 110;
    var mapWidth = global.win.width - 62;
    var mapHeight = global.win.height - 120;
    $('#settings').css('left',ctrlPos);
    $('#page').css('width',mapWidth);
    $('#map').css('height',mapHeight);
}

function setupGuiElements () {
    $('.footerBtn').addClass("ui-button ui-widget ui-state-default ui-button-text-only");
    $('.footerBtn').hover(function(){
        $('.footerBtn').addClass("ui-state-hover");
    }, function(){
        $('.footerBtn').removeClass("ui-state-hover");
    });
}

// function setupMenu() {
//     // Load native UI library


//     // Create an empty menu
//     var menu = new gui.Menu({
//         type: 'menubar'
//     });

//     var cp = require('child_process');
//     var child;

//     // starts child process from menu click
//     menu.append(new gui.MenuItem({
//             label: 'bla',
//             click: function() {
//                 if (child === undefined || child.killed) {
//                     child = cp.fork('F:\\gitProjects\\trakgui_win\\js\\child.js', {
//                         execPath: "C:\\Proggis\\PortableApps\\nodist\\v\\0.10.25\\node.exe"
//                     });
//                     child.on('message', function(m) {
//                         // Receive results from child process
//                         console.log('received: ' + m);
//                     });
//                     child.send("startgps");
//                 }
//             }
//         }

//     ));

//     // kills child process from menu klick
//     menu.append(new gui.MenuItem({
//             label: 'bla1',
//             click: function() {
//                 child.kill();
//             }
//         }

//     ));

//     gui.Window.get().menu = menu;
// }
