var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('ipfs', {
        user: req.session.user
    });
});

router.get('/:id', function (req, res, next) {
   res.redirect('/ipfs')
});

router.get('/:id/history', function (req, res, next) {
    res.render('ipfs_history', {
        user: req.session.user
    });
});

module.exports = router;