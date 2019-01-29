class GamepadController {
    constructor(drone, gamepad, config) {
        this.drone = drone;
        this.gamepad = gamepad;
        this.config = config;
    }

    downEvent(id, num) {
        if (typeof this.config.states["madcatzfightpad"][num] === "undefined") {
            return;
        }
        console.log(this.config.states["madcatzfightpad"][num]);
        switch (num) {
            case 0:
                this.drone.up(speed);
                break;
            case 1:
                this.drone.takeOff();
                break;
            case 2:
                this.drone.down(speed);
                break;
            case 3:
                this.drone.land();
                if (this.video_recording) {
                    this.drone.MediaStreaming.videoEnable(0);
                }
                break;
            case 4:
                this.drone.counterClockwise(speed);
                left_button = true;
                break;
            case 5:
                if (speed - 5 < 0) {
                    console.log("[STATUS] drone reached minimum speed.");
                    return;
                }
                speed -= 5;
                break;
            case 6:
                this.drone.clockwise(speed);
                right_button = true;
                break;
            case 7:
                if (speed + 5 > 100) {
                    console.log("[STATUS] drone reached maximum speed.");
                    return;
                }
                speed += 5;
                break;
            case 8:
                this.drone.leftFlip();
                break;
            case 9:
                this.drone.rightFlip();
                break;
            case 10:
                this.drone.stop();
                break;
        }
        this.printDroneInformation();

        // console.log("down", {
        //     id: id,
        //     num: num,
        // });
    }

    moveEvent(id, axis, value) {
        if (axis === 2 && value === -1) {
            console.log("drone left");
            this.drone.left(speed)
        }

        if (axis === 2 && value === 1) {
            console.log("drone right");
            this.drone.right(speed)
        }

        if (axis === 3 && value === -1) {
            console.log("drone forward");
            this.drone.forward(speed)
        }

        if (axis === 3 && value === 1) {
            console.log("drone backward");
            this.drone.backward(speed)
        }

        if (value !== -1 && value !== 1) {
            this.drone.stop();
        }

        if (axis === 4 && value === -1) {
            rawbotDrone.goUp();
        }

        if (axis === 4 && value === 1) {
            if (!transferring_files) {
                transferring_files = true;
                rawbotDrone.uploadImages();
            }
        }

        if (axis === 5 && value === 1) {
            if (!video_recording) {
                this.drone.MediaRecord.pictureV2();
                console.log("Captured picture.");
            }
        }

        if (axis === 5 && value === -1) {
            if (video_recording) {
                video_recording = false;
                this.drone.MediaStreaming.videoEnable(0);
                console.log("Stopped to record video.");
            } else {
                video_recording = true;
                this.drone.MediaStreaming.videoEnable(1);
                console.log("Started to record video.");
            }
        }


        this.printDroneInformation();
        // console.log("move", {
        //     id: id,
        //     axis: axis,
        //     value: value,
        // });
    }

    upEvent(id, num) {
        left_button = false;
        right_button = false;
        this.drone.stop();

        // console.log("up", {
        //     id: id,
        //     num: num,
        // });
    }

    printDroneInformation() {
        if (right_button && left_button) {
            this.drone.stop();
            console.log(colors.green("______________________________________________________"));
            console.log("Altitude: " + colors.green(altitude));
            console.log("Battery: " + colors.green(battery) + "/100");
            console.log("Speed: " + colors.green(speed) + "/100");
            console.log("Recording video: " + colors.green(video_recording));
            console.log(colors.red("________________________"));
            console.log("GPS information: ");
            console.log("Latitude: " + colors.green(position.latitude));
            console.log("Longitude: " + colors.green(position.longitude));
            console.log("Altitude: " + colors.green(position.altitude));
            console.log(colors.green("______________________________________________________"));
            this.drone.MediaRecord.pictureV2();
        }
    }
}

module.exports = GamepadController;