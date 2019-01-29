const fs = require('fs');

module.exports.upload = (node, path) => {
    return new Promise((resolve, reject) => {
        const files = [
            {
                path: path,
                content: fs.readFileSync(path)
            }
        ];

        node.files.add(files, function (err, files) {
            if (!err) {
                return resolve(files);
            } else {
                return reject(err);
            }
        });
    });
};

module.exports.remove = (node, hash) => {
    return new Promise((resolve, reject) => {
        node.pin.rm(hash, (err) => {
            if (err) {
                return reject(err);
            } else {
                return resolve("Successfully removed hash.");
            }
        });
    });
};

module.exports.deleteFile = (path) => {
    return new Promise((resolve, reject) => {
        fs.unlink(path, function (err) {
            if (err) {
                return reject(err);
            } else {
                return resolve('File deleted successfully');
            }
        });
    });
};