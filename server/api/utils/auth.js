var ethUtil = require('ethereumjs-util');
let fs = require('fs');
let cert = fs.readFileSync('cert');
var jwt = require('jsonwebtoken');

let isLoggedIn = function (req, res, next) {
    if (typeof req.session.user !== "undefined") {
        next();
    } else {
        res.redirect("/");
    }
};

let isLoggedOut = function (req, res, next) {
    if (typeof req.session.user !== "undefined") {
        next();
    } else {
        res.redirect("/");
    }
};

let ensureLogin = function (req, res, next) {
    jwt.verify(req.signedCookies['jwt'], cert, (err, data) => {
        if (err) {
            res.redirect("/");
        } else {
            console.log(data);
            next();
        }
    });
};


function auth(req, res, next) {
    jwt.verify(req.body.token, 'i am another string', function (err, decoded) {
        if (err) {
            res.send(500, {error: 'Failed to authenticate token.'});
        }
        else {
            req.user = decoded.user;
            next();
        }
    });
}

validateSignature = function (req, res, next) {
    var sig = req.body.sig;
    var user = req.body.user;
    var data = 'i am a string';
    var message = ethUtil.toBuffer(data);
    var msgHash = ethUtil.hashPersonalMessage(message);
    // Get the address of whoever signed this message
    var signature = ethUtil.toBuffer(sig);
    var sigParams = ethUtil.fromRpcSig(signature);
    var publicKey = ethUtil.ecrecover(msgHash, sigParams.v, sigParams.r, sigParams.s);
    var sender = ethUtil.publicToAddress(publicKey);
    var address = ethUtil.bufferToHex(sender);

    console.log(address === user)
    if (address === user) {
        jwt.sign({
            user: req.body.addr
        }, cert, {expiresIn: '1h'}, function (err, token) {
            if (err) {
                return res.send({success: false, response: err});
            } else {
                req.session.user = user;
                res.cookie('jwt', token, {
                    signed: true
                });

                return res.send({success: true, PAYLOAD: token});
            }
        });
    } else {
        return res.send(500, {err: 'Signature did not match.'});
    }
};

module.exports.validateSignature = validateSignature;
module.exports.isLoggedIn = isLoggedIn;
module.exports.isLoggedOut = isLoggedOut;
module.exports.ensureLogin = ensureLogin;