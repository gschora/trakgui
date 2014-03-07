function hydroInitRelais() {
    sc.emit("hydroCmd", {
        cmd: "init",
        hydroSpeed: global.cfg.hydroSpeed,
        hydroDuration: global.cfg.hydroDuration
    });
}

function hydroStartAutoSteer() {
    sc.emit("hydroCmd", {
        cmd: "startAutoSteer"
    });
}

function hydroStopAutoSteer() {
    sc.emit("hydroCmd", {
        cmd: "stopAutoSteer"
    });
}

function hydroSteerSingleLeft() {
    sc.emit("hydroCmd", {
        cmd: "singleLeft",
        hydroSpeed: global.cfg.hydroSpeed,
        hydroDuration: global.cfg.hydroDuration
    });
}

function hydroSteerSingleRight() {
    sc.emit("hydroCmd", {
        cmd: "singleRight",
        hydroSpeed: global.cfg.hydroSpeed,
        hydroDuration: global.cfg.hydroDuration
    });
}

function hydroSteerStop() {
    sc.emit("hydroCmd", {
        cmd: "stop"
    });
}

function hydroSetDevicePath() {
    sc.emit("hydroCmd", {
        cmd: "setDevicePath",
        path: global.cfg.hydroDevicePath
    });
}