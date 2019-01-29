let fs = require('fs');
const IPFS = require("ipfs");
let node = new IPFS();
let upload_api = require("../../api/ipfs/IPFS");

node.on("ready", async () => {
    console.log("Node is ready to use!");
    let file_data = fs.readFileSync('./index.html').toString();
    let file_name = 'temp_data' + Date.now() + '.txt';
    let write_file_data = fs.writeFileSync(file_name, file_data, 'utf-8');

    if (fs.existsSync(file_name)) {
        let upload = await  upload_api.upload(node, file_name);
        console.log(upload[0].hash);
    }
});

node.on("error", error => {
    console.error("Something went terribly wrong!", error);
});

node.on("stop", () => {
    console.log("Node stopped!");
});

node.on("start", () => {
});