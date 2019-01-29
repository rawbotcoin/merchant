var express = require('express');
var router = express.Router();
/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('p2d', {
        user: req.session.user
    });
});

router.get('/:device_id', function (req, res, next) {
    res.render('p2d', {
        user: req.session.user
    });
});

router.get('/:device_id/actions', function (req, res, next) {
    res.render('actions', {
        user: req.session.user
    });
});

router.get('/:device_id/information', function (req, res, next) {
    res.render('information', {
        user: req.session.user
    });
});

// router.get('/:device_id/actions/:action_id', function (req, res, next) {
//     res.render('actions', {user: req.session.user});
// });

router.get('/:device_id/actions/:action_id/history', function (req, res, next) {
    res.render('history', {
        user: req.session.user
    });
});

module.exports = router;