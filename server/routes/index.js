var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {
        user: req.session.user
    });
});

router.get('/articles', function (req, res, next) {
    res.render('articles', {
        user: req.session.user
    });
});

router.get('/transactions', function (req, res, next) {
    res.render('transactions', {
        user: req.session.user
    });
});

router.get('/contracts', function (req, res, next) {
    res.json({
        "RawbotAddress": process.env.RAWBOT_ADDRESS,
        "DeviceSpawnerAddress": process.env.DEVICE_SPAWNER_ADDRESS,
        "IPFSAddress": process.env.IPFS_ADDRESS
    });
});

module.exports = router;