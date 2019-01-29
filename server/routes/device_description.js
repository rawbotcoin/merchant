let request = require('request');

module.exports = (req, res, next) => {
    var options = {
        url: req.body['url'],
        method: 'GET',
        headers: {
            'User-Agent': 'request',
        }
    };

    request(options, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            return res.send(body);
        } else {
            return res.send(error);
        }
    });
};