var gui = require('nw.gui');
/**
 * starts all functions in die file
 */
(function() {
    autoReloadPage();
    // setupMenu();
    setupCfg();
    setupKeyBindings();
})();
    
/**
 * sets global Variables and configuration parameters
 */

function setupCfg() {
    if (global.cfg === undefined) global.cfg = {}; //short if
    if (global.mapLayers === undefined) global.mapLayers = {};
    if (global.mapFeatures === undefined) global.mapFeatures = {};

    if (localStorage.imuAccelCalX === undefined) localStorage.imuAccelCalX = 0;
    if (localStorage.imuAccelCalY === undefined) localStorage.imuAccelCalY = 0;
    if (localStorage.imuAntennaHeight === undefined) localStorage.imuAntennaHeight = 0;

    global.cfg.imuAccelCalX = parseInt(localStorage.imuAccelCalX);
    global.cfg.imuAccelCalY = parseInt(localStorage.imuAccelCalY);
    global.cfg.imuAntennaHeight = parseInt(localStorage.imuAntennaHeight);

    global.win = gui.Window.get();
    global.pageReloaded = true; //shows if page is reloaded

    global.cfg.mapProxyHost = '192.168.1.104';
    global.cfg.mapProxyHostPort = '8080';

    global.cfg.rtklibPath = 'tools\\rtklib\\rtknavi_mkl.exe';
    global.cfg.RtklibPort = 8000;
    global.cfg.rtklibMonitorPort = 52001;
    global.cfg.rtklibStartArgs = [];
    global.cfg.rtklibStatus = 0; //0 = not running, 1 = running but not started, 2 = tcp-server started

    global.cfg.gpsUseCompass = true;
    global.cfg.compassLineLength = 15;

    global.cfg.mapAutoCenter = true; //when reload, sets center of map to current point
    global.cfg.mapShowWMSLayer = false; //if true shows wms layer

    global.win.showDevTools();
}

/**
 * auto reloads page in node-webkit everytime something is changed
 */

function autoReloadPage() {
    var fs = require('fs');

    fs.watch('./', [], function() {
        if (location)
            location.reload(false);
    });
}

/**
 * sets up keybindings for control over keyboard
 * @return nothing
 *
 * ctrl + r             reload page
 * ctrl + shift + r     reload application
 * ctrl + k             toggle kiosk mode
 * ctrl + d             open devtool
 */

function setupKeyBindings() {
    global.window.onkeypress = function(key) {
        global.console.log(key);

        if (key.ctrlKey) {
            switch (key.charCode) {
                case 18: // ctrl + r
                    if (key.shiftKey) {
                        global.win.reloadDev();
                    } else {
                        global.win.reload();
                    }

                    break;
                case 11: // ctrl + k
                    global.win.toggleKioskMode();
                    break;
                case 4: // ctrl + d
                    if (global.win.isDevToolsOpen()) {
                        global.win.closeDevTools();
                    } else {
                        global.win.showDevTools();
                    }

                    break;
            }
        }
    };
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
