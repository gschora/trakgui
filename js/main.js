var gui = require('nw.gui');
/**
 * starts all functions in die file
 * @return nothing
 */
(function() {
    autoReloadPage();
    setupMenu();
    setupCfg();
})();

function setupCfg() {
    global.pageReloaded = true;

    global.cfgDebug = false;

    // console.log('setup_cfg');
    global.cfgRtklibPath = 'tools\\rtklib\\rtknavi_mkl.exe';
    global.cfgRtklibPort = 8000;
    global.cfgRtklibMonitorPort = 52001;
    global.cfgRtklibArgs = [];
    global.cfgRtklibStatus = 0; //0 = not running, 1 = running but not started, 2 = tcp-server started
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

function setupMenu() {
    // Load native UI library


    // Create an empty menu
    var menu = new gui.Menu({
        type: 'menubar'
    });

    var cp = require('child_process');
    var child;

    // starts child process from menu click
    menu.append(new gui.MenuItem({
            label: 'bla',
            click: function() {
                if (child === undefined || child.killed) {
                    child = cp.fork('F:\\gitProjects\\trakgui_win\\js\\child.js', {
                        execPath: "C:\\Proggis\\PortableApps\\nodist\\v\\0.10.25\\node.exe"
                    });
                    child.on('message', function(m) {
                        // Receive results from child process
                        console.log('received: ' + m);
                    });
                    child.send("startgps");
                }
            }
        }

    ));

    // kills child process from menu klick
    menu.append(new gui.MenuItem({
            label: 'bla1',
            click: function() {
                child.kill();
            }
        }

    ));

    gui.Window.get().menu = menu;
}
