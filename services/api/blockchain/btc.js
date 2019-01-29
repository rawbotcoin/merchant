const WebSocket = require('ws');
const ws = new WebSocket('wss://ws.blockchain.info/inv');

ws.on('open', function open() {
    console.log("Successfully opened websockets");
    // ws.send('{"op":"blocks_sub"}');
    ws.send('{"op":"unconfirmed_sub"}');

    // {"op":"unconfirmed_sub"}
});

ws.on('message', function incoming(data) {
    console.log(data);
});