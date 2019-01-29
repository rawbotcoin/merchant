module.exports = {
    states: {
        madcatzfightpad: {
            0: "drone up",
            1: "drone take off",
            2: "drone down",
            3: "drone land",
            4: "drone counter clockwise",
            5: "drone decreasing speed",
            6: "drone clockwise",
            7: "drone increase speed",
            8: "drone left flip",
            9: "drone right flip",
            10: "drone stop",
        }
    },
    controls: {
        madcatzfightpad: {
            up: 0,
            takeoff: 1,
            down: 2,
            land: 3,
            counterclockwise: 4,
            decrease_speed: 5,
            clockwise: 6,
            increase_speed: 7,
            left_flip: 8,
            right_flip: 9,
            stop: 10,
            forward: {
                axis: 3,
                value: -1
            },
            backward: {
                axis: 3,
                value: 1
            },
            left: {
                axis: 2,
                value: -1
            },
            right: {
                axis: 2,
                value: 1
            }
        }
    },
    coordinates: {
        home: {
            latitude: 0,
            longitude: 0,
            altitude: 0
        },
        target: {
            latitude: 0,
            longitude: 0,
            altitude: 0
        },
        current_coordinates: "target"
    },
};