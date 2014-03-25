/** 
 * TODO: make settings as module
 *     x eg. load hydro.js and automatically add settings tab with all settings for hydro
 *     x hydro.js has all buttons, txtfields and adds them via jquery
 */



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
    styleBtnSettings();
    setPositionOnResize();
    setupBtnToogleMapAutoCenter();
    setupBtnToogleMapShowWMS();
    setupBtnGpsUseCompass();
    setupBtnSetDriveLineManual();
    setupBtnActiveDriveLineDelete();
    setupbtnGpsStartPoint();
    setupbtnGpsEndPoint();
    setupBtnHydro();

    setupSettingsAccordion();
}

/**
 * ----------------------------------------------------------------------------
 * map page
 * ----------------------------------------------------------------------------
 */


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

function styleBtnSettings() {
    $('.btnSettings').addClass("ui-button ui-widget ui-state-default ui-button-text-only");
    $('.btnSettings').hover(function() {
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
                localStorage.mapAutoCenter = global.cfg.mapAutoCenter = false;
            } else {
                $('#btnToogleMapAutoCenter').addClass("ui-state-active");
                localStorage.mapAutoCenter = global.cfg.mapAutoCenter = true;
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
                localStorage.mapShowWMSLayer = global.cfg.mapShowWMSLayer = false;
            } else {
                $('#btnToogleMapShowWMS').addClass("ui-state-active");
                global.mapLayers.wms.setVisibility(true);
                localStorage.mapShowWMSLayer = global.cfg.mapShowWMSLayer = true;
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
            // if (global.cfg.sensorConnected) {

            if (global.cfg.gpsUseCompass) {
                $('#btnGpsUseCompass').removeClass("ui-state-active");
                global.mapLayers.vector_compass.setVisibility(false);
                localStorage.gpsUseCompass = global.cfg.gpsUseCompass = false;
                stopSensor();
            } else {
                if (typeof io !== "undefined" && sc.socket.connected) {
                    $('#btnGpsUseCompass').addClass("ui-state-active");
                    global.mapLayers.vector_compass.setVisibility(true);
                    localStorage.gpsUseCompass = global.cfg.gpsUseCompass = true;
                    startSensor();
                }
            }
        }
        // }

    );
}

function setupBtnSetDriveLineManual() {
    $('#btnDriveLineManual').click(function() {
        var featureCtrl = global.map.getControlsBy("displayClass", "olControlDrawFeature")[0];
        if (!featureCtrl.active || featureCtrl === null) {
            featureCtrl.activate();
            $('#btnDriveLineManual').addClass("ui-state-active");
        } else {
            featureCtrl.deactivate();
            $('#btnDriveLineManual').removeClass("ui-state-active");
        }
    });
}

function setupbtnGpsStartPoint() {
    $('#btnGpsStartPoint').click(function() {
        setDriveLineStartGPS();
        if (global.cfg.hydroAutoSteer) $('#btnHydroAutoSteer').click();
    });

}

function setupbtnGpsEndPoint() {
    $('#btnGpsEndPoint').click(function() {
        setDriveLineEndGPS();
    });

}

function setupBtnActiveDriveLineDelete() {
    $('#btnActiveDriveLineDelete').click(function() {
        deleteDriveLine();
    });
}

function setupBtnHydro() {
    $('#btnHydroSingleLeft').click(function() {
        hydroSteerSingleLeft();
    });
    $('#btnHydroSingleRight').click(function() {
        hydroSteerSingleRight();
    });
    $('#btnHydroStop').click(function() {
        if (global.cfg.hydroAutoSteer) $('#btnHydroAutoSteer').click();
        hydroSteerStop();
    });

    if (global.cfg.hydroAutoSteer) {
        $('#btnHydroAutoSteer').addClass("ui-state-active");
    } else {
        $('#btnHydroAutoSteer').removeClass("ui-state-active");
    }

    $('#btnHydroAutoSteer').click(function() {
        if (global.cfg.hydroAutoSteer) {
            $('#btnHydroAutoSteer').removeClass("ui-state-active");
            hydroStopAutoSteer();
            localStorage.hydroAutoSteer = global.cfg.hydroAutoSteer = false;

        } else {
            $('#btnHydroAutoSteer').addClass("ui-state-active");
            hydroStartAutoSteer();
            localStorage.hydroAutoSteer = global.cfg.hydroAutoSteer = true;
        }
    });
}

/**
 * ----------------------------------------------------------------------------
 * settings page
 * ----------------------------------------------------------------------------
 */

function setupSettingsAccordion() {
    $('#settingsPage').accordion();
    $('#btnSaveSettings').button();
    $('#btnSaveSettings').click(function() {
        saveSettingsTabProgs();
        saveSettingsTabOptions();
        saveSettingsTabSensor();
        saveSettingsTabHydro();
    });

    if (global.cfg.ctrlEnableEcho) {
        $('#btnEnableEcho').addClass("ui-state-active");
    } else {
        $('#btnEnableEcho').removeClass("ui-state-active");
    }
    $('#btnEnableEcho').click(function() {
        if (global.cfg.ctrlEnableEcho) {
            $('#btnEnableEcho').removeClass("ui-state-active");
            localStorage.ctrlEnableEcho = global.cfg.ctrlEnableEcho = false;
            setEnableEcho(false);
        } else {
            $('#btnEnableEcho').addClass("ui-state-active");
            localStorage.ctrlEnableEcho = global.cfg.ctrlEnableEcho = true;
            setEnableEcho(true);
        }

    });
    setupSettingsTabPrograms();
    setupSettingsTabOptions();
    setupSettingsTabSensor();
    setupDialogSensorCalibration();
    setupSettingsTabHydro();


}

function setupSettingsTabPrograms() {
    $('#txtRtklibPath').val(global.cfg.rtklibPath);
    $('#txtRtklibPort').val(global.cfg.rtklibPort);
    $('#txtRtklibMonitorPort').val(global.cfg.rtklibMonitorPort);
    $('#txtRtklibStartArgs').val(global.cfg.rtklibStartArgs);

    $('#txtMapproxyPath').val(global.cfg.mapProxyPath);
    $('#txtMapproxyStartArgs').val(global.cfg.mapProxyStartArgs);
    $('#txtMapproxyHost').val(global.cfg.mapProxyHost);
    $('#txtMapproxyPort').val(global.cfg.mapProxyHostPort);

}

function setupSettingsTabOptions() {
    $('#chkUseCompass').prop('checked', global.cfg.gpsUseCompass);
    $('#txtCompassLineLength').val(global.cfg.compassLineLength);
    $('#chkMapAutoCenter').prop('checked', global.cfg.mapAutoCenter);
    $('#chkShowWmsLayer').prop('checked', global.cfg.mapShowWMSLayer);
    $('#txtDriveLineMoveSpacing').val(global.cfg.driveLineMoveSpacing);
    $('#txtDriveLineSpacing').val(global.cfg.driveLineSpacing);

    $('#txtLowPass').val(global.cfg.gpsLowPass);
    $('#statusHeader_lowPass').html(global.cfg.gpsLowPass);
    $('#txtLowPass').attr("title", "up:shift+z down:shift+h");
    $('#txtLowPass').spinner({
        incremental: false,
        min: 1,
        step: 1,
        change: function() {
            localStorage.gpsLowPass = global.cfg.gpsLowPass = parseInt($('#txtLowPass').val());
            $('#statusHeader_lowPass').html(global.cfg.gpsLowPass);
        }
    });

    $('#txtHighPass').val(global.cfg.gpsHighPass);
    $('#statusHeader_highPass').html(global.cfg.gpsHighPass);
    $('#txtHighPass').attr("title", "up:shift+u down:shift+j");
    $('#txtHighPass').spinner({
        incremental: false,
        min: 20,
        step: 1,
        change: function() {
            localStorage.gpsHighPass = global.cfg.gpsHighPass = parseInt($('#txtHighPass').val());
            $('#statusHeader_highPass').html(global.cfg.gpsHighPass);
        }
    });


    $('#chkUseFilter').prop('checked', global.cfg.useFilter);
    $('#chkUseFilter').change(function() {
        localStorage.useFilter = global.cfg.useFilter = $('#chkUseFilter').prop('checked');
    });
    $('#txtFilter').val(global.cfg.distanceFilterVal);
    $('#txtFilter').spinner({
        incremental: false,
        min: 0.1,
        max: 0.9,
        step: 0.1,
        change: function() {
            localStorage.distanceFilterVal = global.cfg.distanceFilterVal = parseFloat($('#txtFilter').val());
        }
    });
}

function setupSettingsTabHydro() {
    $('#txtHydroSpeed').attr("title", "up:o down:l");
    $('#txtHydroSpeed').spinner({
        incremental: false,
        min: 100,
        step: 100,
        change: function() {
            localStorage.hydroSpeed = global.cfg.hydroSpeed = parseInt($('#txtHydroSpeed').val());
            $('#statusHeader_hydroSpeed').html(global.cfg.hydroSpeed);
        }
    });
    $('#txtHydroSpeed').val(parseInt(global.cfg.hydroSpeed));
    $('#statusHeader_hydroSpeed').html(parseInt(global.cfg.hydroSpeed));



    $('#txtHydroDuration').attr("title", "up:strg+o down:strg+l");
    $('#txtHydroDuration').spinner({
        incremental: false,
        min: 100,
        step: 100,
        change: function() {
            localStorage.hydroDuration = global.cfg.hydroDuration = parseInt($('#txtHydroDuration').val());
            $('#statusHeader_hydroDuration').html(global.cfg.hydroDuration);
        }
    });
    $('#txtHydroDuration').val(parseInt(global.cfg.hydroDuration));
    $('#statusHeader_hydroDuration').html(parseInt(global.cfg.hydroDuration));

    $('#txtHydroDevicePath').val(global.cfg.hydroDevicePath);
    $('#btnSetHydroDevicePath').click(function() {
        localStorage.hydroDevicePath = global.cfg.hydroDevicePath = $('#txtHydroDevicePath').val();
        hydroSetDevicePath();
    });



}

function setupSettingsTabSensor() {
    $('#btnCfgStartSensor').click(function() {
        if (btnSensorDataState) {
            btnSensorDataState = false;
            $('#btnCfgStartSensor').removeClass("ui-state-active");
            clearTimeout(sensorTimer);
            global.cfg.imuSensorSpeed = localStorage.imuSensorSpeed;
            setSensorSpeed();
            if (!global.cfg.gpsUseCompass) {
                stopSensor();
            }
        } else {
            if (global.cfg.sensorConnected) {
                btnSensorDataState = true;
                $('#btnCfgStartSensor').addClass("ui-state-active");
                setSensorSpeed(250);
                startSensor();
                global.cfg.imuSensorSpeed = 250;
                updateTxtImu();
            } else {
                settingsInfo("sensor NOT connected!!!");
            }
        }
    });

    $('#btnSetSensorDevicePath').click(function() {
        localStorage.sensorDevicePath = global.cfg.sensorDevicePath = $('#txtSensorDevicePath').val();
        setSensorDevicePath();
    });

    $('#btnCfgResetSensor').click(function() {
        global.cfg.imuAccelCalX = 0;
        global.cfg.imuAccelCalY = 0;
        $('#txtImuAccelCalX').html(global.cfg.imuAccelCalX);
        $('#txtImuAccelCalY').html(global.cfg.imuAccelCalY);
    });
    $('#btnCfgSaveSensor').click(function() {
        localStorage.imuAccelCalX = global.cfg.imuAccelCalX = parseFloat($('#txtImuAccelCalX').html());
        localStorage.imuAccelCalY = global.cfg.imuAccelCalY = parseFloat($('#txtImuAccelCalY').html());
        settingsInfo("sensor settings saved!");
    });

    $('#btnConnectCtrler').click(function() {
        if (typeof io === "undefined") {
            loadIO();
        }
        if (typeof io !== "undefined" && !sc.socket.connected) {
            sc.socket.reconnect();
        }
    });

    $('#btnDialogSensorCalibrate').click(function() {
        $('#btnCfgStartSensor').click();
        $('#dialogSensorCalibration').dialog('open');
    });

    $('#txtImuSensorSpeed').val(global.cfg.imuSensorSpeed);
    $('#txtImuAntennaHeight').val(global.cfg.imuAntennaHeight);
    $('#txtImuAccelCalX').html(global.cfg.imuAccelCalX);
    $('#txtImuAccelCalY').html(global.cfg.imuAccelCalY);

    $('#txtSensorControlerHost').val(global.cfg.sensorControlerHost);
    $('#txtSensorControlerPort').val(global.cfg.sensorControlerPort);
    $('#txtSensorDevicePath').val(global.cfg.sensorDevicePath);
}

var calSide = 0;
var calTimeOut;

function setupDialogSensorCalibration() {
    //FIXME:   check if sensor is reachable and connected before opening the dialog
    $('#dialogSensorCalibration').dialog({
        autoOpen: false,
        modal: true,
        height: 300,
        width: 500,
        title: "calibration for compass",
        buttons: [{
            text: "OK",
            click: function() {
                $(this).dialog("close");
            }
        }],
        beforeClose: function(event, ui) {
            clearTimeout(calTimeOut);
            if (btnSensorDataState) {
                $('#btnCfgStartSensor').click();
            }
        }
    });

    $('#btnDialogCalibrateSensorStart').click(function() {
        switch (calSide) {
            case 0:
                calSide++;
                calSec = 60;
                $('#dialogImuCompassTxt').html("north set! now rotate 90deg...then hit button");
                $('#btnDialogCalibrateSensorStart').html("set east...");
                calCountdown();
                calibrateSensor();
                break;
            case 1:
                clearTimeout(calTimeOut);
                calSide++;
                calSec = 60;
                $('#dialogImuCompassTxt').html("east set! now rotate 90deg...then hit button");
                $('#btnDialogCalibrateSensorStart').html("set south...");
                calCountdown();
                calibrateSensor();
                break;
            case 2:
                clearTimeout(calTimeOut);
                calSide++;
                calSec = 60;
                $('#dialogImuCompassTxt').html("south set! now rotate 90deg...then hit button");
                $('#btnDialogCalibrateSensorStart').html("finish...");
                calCountdown();
                calibrateSensor();
                break;
            case 3:
                clearTimeout(calTimeOut);
                calSide = 0;
                calSec = 60;
                $('#dialogImuCompassTxt').html("west set! Finished!!!");
                $('#btnDialogCalibrateSensorStart').html("start...");
                calibrateSensor();
                break;
        }
    });
}
var calSec = 60;

function calCountdown() {
    if (calSec <= 0) {
        clearTimeout(calTimeOut);
        calSide = 0;
        calSec = 60;
        $('#dialogImuCompassTxt').html("Timeout! restart by hitting start...");
        $('#dialogImuCompassCountdownTxt').html(calSec);
        $('#btnDialogCalibrateSensorStart').html("start...");

    } else {
        $('#dialogImuCompassCountdownTxt').html(calSec--);
        calTimeOut = setTimeout(calCountdown, 1000);
    }
}

function saveSettingsTabProgs() {
    localStorage.rtklibPath = global.cfg.rtklibPath = $('#txtRtklibPath').val();
    localStorage.rtklibPort = global.cfg.rtklibPort = parseInt($('#txtRtklibPort').val());
    localStorage.rtklibMonitorPort = global.cfg.rtklibMonitorPort = parseInt($('#txtRtklibMonitorPort').val());
    localStorage.rtklibStartArgs = global.cfg.rtklibStartArgs = ($('#txtRtklibStartArgs').val()).split(",");

    localStorage.mapProxyPath = global.cfg.mapProxyPath = $('#txtMapproxyPath').val();
    localStorage.mapProxyStartArgs = global.cfg.mapProxyStartArgs = ($('#txtMapproxyStartArgs').val()).split(",");
    localStorage.mapProxyHost = global.cfg.mapProxyHost = $('#txtMapproxyHost').val();
    localStorage.mapProxyPort = global.cfg.mapProxyHostPort = parseInt($('#txtMapproxyPort').val());

    settingsInfo("all program settings saved...");
}

function saveSettingsTabOptions() {
    localStorage.gpsUseCompass = global.cfg.gpsUseCompass = $('#chkUseCompass').prop('checked');
    localStorage.compassLineLength = global.cfg.compassLineLength = parseInt($('#txtCompassLineLength').val());
    localStorage.mapAutoCenter = global.cfg.mapAutoCenter = $('#chkMapAutoCenter').prop('checked');
    localStorage.mapShowWMSLayer = global.cfg.mapShowWMSLayer = $('#chkShowWmsLayer').prop('checked');
    localStorage.driveLineMoveSpacing = global.cfg.driveLineMoveSpacing = parseInt($('#txtDriveLineMoveSpacing').val());
    localStorage.driveLineSpacing = global.cfg.driveLineSpacing = parseInt($('#txtDriveLineSpacing').val());
    settingsInfo("all option settings saved...");
}

function saveSettingsTabSensor() {
    localStorage.imuSensorSpeed = global.cfg.imuSensorSpeed = parseInt($('#txtImuSensorSpeed').val());
    localStorage.imuAntennaHeight = global.cfg.imuAntennaHeight = parseInt($('#txtImuAntennaHeight').val());
    localStorage.imuAccelCalX = global.cfg.imuAccelCalX = parseFloat($('#txtImuAccelCalX').html());
    localStorage.imuAccelCalY = global.cfg.imuAccelCalY = parseFloat($('#txtImuAccelCalY').html());

    localStorage.sensorControlerHost = global.cfg.sensorControlerHost = $('#txtSensorControlerHost').val();
    localStorage.sensorControlerPort = global.cfg.sensorControlerPort = parseInt($('#txtSensorControlerPort').val());
    localStorage.sensorDevicePath = global.cfg.sensorDevicePath = $('#txtSensorDevicePath').val();

    settingsInfo("all sensor settings saved...");
}

function saveSettingsTabHydro() {
    localStorage.hydroDevicePath = global.cfg.hydroDevicePath = $('#txtHydroDevicePath').val();
    settingsInfo("all hydro settings saved...");
}


function settingsInfo(infoText, msgType) {

    $('#settingsAlert').html(infoText);
    $('#settingsAlert').toggle("fade", 200).toggle("fade", 2000);
}

var btnSensorDataState = false;
var sensorTimer;

function updateTxtImu() {
    var sensorData = getSensorData(true);
    // global.console.log(sensorData.x_tilt+":"+(sensorData.x_tilt-global.cfg.imuAccelCalX)+"|"+sensorData.y_tilt+":"+(sensorData.y_tilt-global.cfg.imuAccelCalY));
    $('#txtImuAccelCalX').html((sensorData.x_tilt - global.cfg.imuAccelCalX).toFixed(1));
    $('#txtRealImuAccelCalX').html(sensorData.x_tilt.toFixed(1));

    $('#txtImuAccelCalY').html((sensorData.y_tilt - global.cfg.imuAccelCalY).toFixed(1));
    $('#txtRealImuAccelCalY').html(sensorData.y_tilt.toFixed(1));

    $('#txtImuCompassAngle').html(sensorData.angle_compass);
    $('#txtImuCompassPitch').html(sensorData.pitch_compass);
    $('#txtImuCompassRoll').html(sensorData.roll_compass);
    $('#dialogImuCompassAngle').html(sensorData.angle_compass);

    sensorTimer = setTimeout(updateTxtImu, global.cfg.imuSensorSpeed);
}
