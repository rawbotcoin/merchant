require('dotenv').config();
require('dotenv').config({path: '/Users/hassanjawhar/Desktop/Workspace/rawbot-backend/device/.env'});
let Wrapper = require('/Users/hassanjawhar/Desktop/Workspace/node-rawbot');
colors = require('colors');
let bebop = require('node-bebop');
let gamepad = require("gamepad");
let drone = bebop.createClient();
let config = require('./config/config');


/**
 * Global variables
 */


indoor = process.argv[2] === "in";
env_running = indoor === true ? "indoor" : "outdoor";
min_altitude = 1;
max_altitude = indoor === true ? process.env.MINIMUM_ALTITUDE : process.env.MAXIMUM_ALTITUDE;
speed = 30;
altitude = 0;
battery = 0;
right_button = false;
left_button = false;
video_recording = false;
transferring_files = false;
position = {};


rawbotDrone = new (require('./lib/RawbotDrone'))(drone, config);
let GamepadController = new (require('./lib/GamepadController'))(drone, gamepad, config);

gamepad.init();

setInterval(gamepad.processEvents, 16);
setInterval(gamepad.detectDevices, 500);

console.log("Running in " + colors.green(env_running) + " environment");
console.log("Max altitude: " + colors.green(max_altitude) + "m");

drone.connect(function () {
    drone.PilotingSettings.minAltitude(min_altitude);
    drone.PilotingSettings.maxAltitude(max_altitude);

    drone.on("ready", rawbotDrone.onReadyState);
    drone.on("NavigateHomeStateChanged", rawbotDrone.captureTargetState);
    drone.on("battery", function (data) {
        battery = data;
    });

    drone.on("PositionChanged", function (data) {
        position = data;
    });
    drone.on("AltitudeChanged", function (data) {
        altitude = data.altitude;
        if (altitude >= process.env.MAXIMUM_ALTITUDE) {
            if (right_button && left_button) {
                rawbotDrone.fiveFlips();
            }
        }
    });

    gamepad.on("down", GamepadController.downEvent);
    gamepad.on("move", GamepadController.moveEvent);
    gamepad.on("up", GamepadController.upEvent);
});

let device = new Wrapper(
    process.env.ACCOUNT_PRIVATE_KEY,
    process.env.ACCOUNT_ADDRESS,
    process.env.RAWBOT_ADDRESS,
    process.env.DEVICE_MANAGER_ADDRESS,
    process.env.DEVICE_ADDRESS,
    process.env.INFURA_KEY,
    process.env.NETWORK
);

device.ActionLogs((err, event_name, event_data) => {
    if (!err) {
        if (event_data[5] === "Fly and Capture") {
            rawbotDrone.takeOffAndCapture();
        }
    }
});