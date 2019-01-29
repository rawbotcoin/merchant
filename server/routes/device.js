var express = require('express');
var router = express.Router();
/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('actions', {
        user: req.session.user
    });
});

router.get('/information', function (req, res, next) {
    res.render('information', {
        user: req.session.user
    });
});

router.get('/actions/:action_id/history', function (req, res, next) {
    res.render('history', {
        user: req.session.user
    });
});

module.exports = router;