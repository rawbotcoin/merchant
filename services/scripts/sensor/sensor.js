require('dotenv').config({path: '/Users/hassanjawhar/Desktop/Workspace/rawbot-backend/device/.env'});
let Wrapper = require('/Users/hassanjawhar/Desktop/Workspace/node-rawbot');
let fs = require('fs');
const IPFS = require("ipfs");
let node = new IPFS();
let upload_api = require("../../api/ipfs/IPFS");
let encryption = require('../../api/utils/encryption');
let request = require('request');
const shell = require('shelljs');

let text = "Some random words that I wrote";

let apply_key = function (pgp_key, email) {
    shell.exec(`./apply_key.sh ${pgp_key} ${email}`);
};

let encrypt_file = function (email, file) {
    shell.exec(`./encrypt_file.sh ${email} ${file}`);
};
let ready = false;
node.on("ready", () => {
    console.log("Node is ready to use!");
    // doTasks(0, 'devhassanjawhar@gmail.com', 'eHXReZk3');

    ready = true;
});

node.on("error", error => {
    console.error("Something went terribly wrong!", error);
});

node.on("stop", () => {
    console.log("Node stopped!");
});

node.on("start", () => {
});

let device_wrapper_1 = new Wrapper(
    process.env.ACCOUNT_PRIVATE_KEY,
    process.env.ACCOUNT_ADDRESS,
    process.env.RAWBOT_ADDRESS,
    process.env.DEVICE_MANAGER_ADDRESS,
    process.env.DEVICE_ADDRESS_1,
    process.env.INFURA_KEY,
    process.env.NETWORK
);

String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

device_wrapper_1.getBalance(process.env.ACCOUNT_ADDRESS).then(balance => {
    console.log(balance)
}).catch(err => {
    console.log(err)
})

device_wrapper_1.IPFSLogs(async (err, event_name, data) => {
    if (!err) {
        if (!ready) {
            return;
        }
        let ipfs_log = data.returnValues;
        let ipfs_action_logs_index = ipfs_log["ipfs_action_logs_index"];

        let _email = device_wrapper_1.web3.utils.toAscii(ipfs_log["email"]);
        let _pubkey = device_wrapper_1.web3.utils.toAscii(ipfs_log["pubkey"]);

        let email = _email.replaceAll(' ', '');
        let pubkey = _pubkey.replaceAll(' ', '');

        let file_name = 'temp_data' + Date.now() + '.txt';
        let pgp_file_name = 'temp_pubkey_' + Date.now() + '.gpg';

        let fetched_public_key = await getPublicKey(pubkey);
        let write_public_key = fs.writeFileSync(pgp_file_name, fetched_public_key);
        apply_key(pgp_file_name, email);
        let write_file_data = fs.writeFileSync(file_name, text, 'utf-8');
        encrypt_file(email, file_name);

        if (fs.existsSync(pgp_file_name)) {
            let upload = await upload_api.upload(node, file_name);
            // console.log(upload[0].)
            console.log(upload[0].hash);
            let addIPFSResult = await device_wrapper_1.addIPFSResult(ipfs_action_logs_index, upload[0].hash);
            console.log(addIPFSResult);
        } else {

        }

    } else {
        console.error(err);
    }
});


function getPublicKey(pastebin_id) {

    var options = {
        url: 'https://pastebin.com/raw/' + pastebin_id,
        method: 'GET',
        headers: {
            'User-Agent': 'request',
        }
    };

    return new Promise((resolve, reject) => {
        request(options, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                return resolve(body);
            } else {
                return reject(error);
            }
        });
    });
}