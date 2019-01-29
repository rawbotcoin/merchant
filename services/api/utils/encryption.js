const exec = require('child_process').exec;

function execute(command_line_) {
    return new Promise((resolve, reject) => {
        exec(command_line_,
            (error, stdout, stderr) => {
                console.log(`${stdout}`);
                console.log(`${stderr}`);
                if (error !== null) {
                    console.log(`exec error: ${error}`);
                    return reject(error);
                } else {
                    return resolve(command_line_);
                }
            });
    });
}

function generateKeys(batch_file) {
    return new Promise((resolve, reject) => {
        execute('gpg --batch --gen-key ' + batch_file)
            .then(result => {
                return resolve(result);
            })
            .catch(err => {
                return reject(err);
            });
    });
}

function encryptFile(real_name, file_path) {
    return new Promise((resolve, reject) => {
        execute('gpg -r ' + real_name + ' --encrypt ' + file_path)
            .then(result => {
                return resolve(file_path + '.gpg');
            })
            .catch(err => {
                return reject(err);
            });
    });
}

function decryptFile(file_path, file_destination) {
    return new Promise((resolve, reject) => {
        execute('gpg --decrypt ' + file_path + ' > ' + file_destination)
            .then(result => {
                return resolve(result);
            })
            .catch(err => {
                return reject(err);
            });
    });
}

module.exports = {
    execute,
    generateKeys,
    encryptFile,
    decryptFile
};