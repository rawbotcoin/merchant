var async = require('async');
var Client = require('ftp');
var c = new Client();
var fs = require('fs');
let options = {
    host: "192.168.42.1"
};

class RawbotDrone {

    constructor(drone, config) {
        this.i = 1;
        this.drone = drone;
        this.config = config;
        this.drone.GPSSettings.setHome(this.config.coordinates.target);
        this.capture_target = false;
        this.arrived_home = false;
        this.arrived_target = false;
    }

    goUp() {
        this.drone.up(100);
    }

    fiveFlips() {
        setTimeout(() => {
            if (this.i === 5) {
                this.drone.frontFlip();
                console.log("[" + this.i + "] Flip sequence: front flip");
                console.log("Ending the flip sequence.");
                this.i = 1;
            } else {
                console.log("[" + this.i + "] Flip sequence: left flip");
                this.drone.flipLeft();
                this.fiveFlips();
                this.i++;
            }
        }, 3000);
    };

    takeOffAndCapture() {
        this.drone.takeOff();
        console.log("Drone taking off");
        setTimeout(() => {
            this.drone.MediaRecord.pictureV2();
            console.log("Capturing paid picture.");
        }, 10 * 1000);
        setTimeout(() => {
            this.drone.land();
            console.log("Drone lading.");
        }, 15 * 1000);
    }

    captureTargetState(data) {
        if (this.capture_target) {
            if (typeof data.state !== "undefined") {
                return;
            }
            if (typeof data.reason !== "undefined") {
                if (data.reason === "finished" && this.config.coordinates.current_config.coordinates === "home" && !this.arrived_home) {
                    this.arrived_home = true;
                    console.log("Successfully arrived home and landing.");
                    this.drone.stop();
                    this.drone.land();
                }

                if (data.reason === "finished" && this.config.coordinates.current_config.coordinates === "target" && !this.arrived_target) {
                    this.arrived_target = true;
                    if (!video_recording) {
                        drone.MediaRecord.pictureV2();
                        console.log("Capturing picture at target coordinates.");
                    }
                    this.drone.GPSSettings.setHome(this.config.coordinates.home);
                    setTimeout(() => {
                        this.drone.Piloting.navigateHome(1);
                    }, 10 * 1000);
                }
            }
        }
    }

    onReadyState() {
        if (this.capture_target) {
            this.drone.takeOff();

            setTimeout(() => {
                this.drone.Piloting.navigateHome(1);
            }, 10 * 1000);
        }
    }

    uploadImages() {
        async.series({
            one: function (parallelCb) {
                c.connect(options);
                c.on('ready', function () {
                    parallelCb(null, "");
                });
            },
            two: function (parallelCb) {
                c.list(function (err, list) {
                    if (err) {
                        parallelCb(err, "");
                    } else {
                        parallelCb(null, list);
                    }
                })
            },
            three: function (parallelCb) {
                c.cwd("internal_000/Bebop_2/media", (err, dir) => {
                    if (err) {
                        parallelCb(err, "");
                    } else {
                        parallelCb(null, dir);
                    }
                })
            },
            four: function (parallelCb) {
                c.list(function (err, list) {
                    if (err) {
                        parallelCb(err, "");
                    } else {
                        parallelCb(null, list);
                    }
                })
            }
        }, function (err, results) {
            if (!err) {
                let media = results.four;
                media.forEach(m => {
                    // console.log(m.name);
                    if (m.name.includes(".jpg")) {
                        c.get(m.name, false, function (err, readableStream) {
                            if (!err) {
                                readableStream.pipe(fs.createWriteStream("./media/" + m.name));
                            }
                        })
                    }
                });
                transferring_files = false;
                c.end();
                console.log("Successfully transferred all image files to media folder.");
            }
        });
    }
}

module.exports = RawbotDrone;