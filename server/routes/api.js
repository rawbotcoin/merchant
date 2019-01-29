var express = require('express');
var router = express.Router();
var request = require('request');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.send("API break");
});

router.get('/eth-price', async (req, res, next) => {
    let price = await getBittrexEthereumPrice();
    res.json({
        "eth-usd": price
    });
});

// router.get('/articles', require('../api/articles/articles'));

var options = {
    url: 'https://bittrex.com/api/v1.1/public/getticker?market=USD-ETH',
    method: 'GET',
    headers: {
        'User-Agent': 'request',
    }
};

function getBittrexEthereumPrice() {
    return new Promise((resolve, reject) => {
        request(options, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                var info = JSON.parse(body);
                return resolve(info.result.Last);
            } else {
                return reject(error);
            }
        });
    });
}

module.exports = router;