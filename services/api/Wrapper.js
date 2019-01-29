const Web3 = require('web3');
const device_json = require('../build/contracts/Device.json');
class Wrapper {
    constructor(network) {
        this.web3 = new Web3(network);
        this.device_json = device_json;
    }

    initContract(address, options) {
        this.contract = new this.web3.eth.Contract(device_json.abi, address, options);
    }

    eventListener(options, callback) {
        return this.contract.events.ActionLogs(options, callback);
    }

    getNetwork() {
        return new Promise((resolve, reject) => {
            this.web3.eth.net.getNetworkType().then(result => {
                return resolve(result)
            });
        })
    }

    createWallet(random_chars) {
        return this.web3.eth.accounts.create(random_chars);
    }
}

module.exports = Wrapper;
