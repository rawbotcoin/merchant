require('dotenv').config();
const wrapper = new (require('./api/Wrapper'))("wss://ropsten.infura.io/ws"); 
let five = require("johnny-five");
let board = new five.Board();
let relay;
let ready = false;

board.on("ready", function () {
    relay = new five.Relay(10);
    ready = true;
});

async function executeAll() {
    const start = Date.now();
    let isListening = await wrapper.web3.eth.net.isListening();
    if (!isListening) {
        return;
    }
    let network = await wrapper.getNetwork();
    console.log(`Currently listening on network: ${network}`)
    let balance = await wrapper.web3.eth.getBalance(process.env.ACCOUNT_ADDRESS);
    console.log(`Current balance ${balance} ETH`)
    let initContract = await wrapper.initContract(process.env.DEVICE_ADDRESS, {
        from: process.env.ACCOUNT_ADDRESS
    });
    console.log(`Successfully initiated smart contract`);
    wrapper.eventListener({
        fromBlock: 0
    }, (err, event) => {
        // console.log(event)
    })
        .on('data', (event) => {
            if ((Date.now() - start) / 1000 > 1) {
                console.log(event)
                if (event.returnValues) {
                    const id = event.returnValues.id;
                    const enable = event.returnValues.enable;
                    /**
                     * {id} is the action's id that refers to the sensor or or circuit number
                     * {enable} is the flag whether it's to enable or disable the device
                     * {time} is the duration that the action stays alive
                     */
                    if (id === 1) {
                        if (ready) {
                            if (enable) {
                                relay.on();
                            } else {
                                relay.off();
                            }
                        }
                    }
                }
            }
        })
        .on('changed', (event) => {
            // remove event from local database
        })
        .on('error', console.error);
}

executeAll();