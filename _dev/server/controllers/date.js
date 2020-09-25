//

const LastUpdated = require('../models/date');

//

exports.getLastUpdated = (req, res, next) => {

    LastUpdated.find({})

        .then(results => {

            res.json(results);

        })

        .catch((error) => next(error));

};