let encryption = require('../utils/encryption');
let ipfs_api = require('./IPFS');
const multer = require('multer');
let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname + '')
    }
});

let upload = multer({
    storage: storage
});

let req_upload = async (req, res, next) => {
    if (typeof req.files !== "undefined") {
        if (req.files.length !== 1) {
            return;
        }
        let file = req.files[0];
        let file_path = base_path + '/uploads/' + file.originalname;
        let result = await encryption.encryptFile(file_path);
        let upload_result = await ipfs_api.upload(node, result);
        // let delete_original = await ipfs_api.deleteFile(file_path);
        // let delete_encrypted = await ipfs_api.deleteFile(file_path + '.gpg');
        let url = 'https://gateway.ipfs.io/ipfs/' + upload_result[upload_result.length - 1].hash;
        console.log(url);
        return res.send(url);
    }
};

let req_decrypt = function (req, res, next) {
    if (typeof req.files !== "undefined") {
        if (req.files.length === 0) {
            return;
        }

        req.files.forEach(file => {
            let file_path = base_path + '/uploads/' + file.originalname;
            let file_path_decrypted = base_path + '/uploads/' + file.originalname + '_' + Date.now();
            let d = encryption.decryptFile(file_path, file_path_decrypted);
            console.log("Successfully decrypted file: " + file.originalname);
        });
    }
};

module.exports = {
    req_upload,
    req_decrypt,
    upload
};