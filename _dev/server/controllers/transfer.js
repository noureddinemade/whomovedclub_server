//

const Transfer = require('../models/transfer');

//

exports.getAllTransfers = (req, res, next) => {

    Transfer.find({})

        .then(results => {

            res.json(results);

        })

        .catch((error) => next(error));

};

// Get a number of transfers

exports.getTransfersByLimit = (req, res, next) => {

    const limit = +req.params.limit;

    Transfer.find({}).limit(limit)

        .then(results => {

            res.json(results);

        })

        .catch((error) => next(error));

};

// Get transfers by league

exports.getTransfersByLeague = (req, res, next) => {

    const league    = req.params.league;
    const filter    = league.replace(/-/g, ' ');

    Transfer.find({ league: filter })

        .then(results => {

            res.json(results);

        })

        .catch((error) => next(error));

};

// Get transfers by team

exports.getTransfersByTeam = (req, res, next) => {

    const team      = req.params.team;
    const filter    = team.replace(/-/g, ' ');

    Transfer.find({ $or: [{ teamIn: filter },{ teamOut: filter }] })

        .then(results => {

            res.json(results);

        })

        .catch((error) => next(error));

};

exports.getTransfersByTeamIn = (req, res, next) => {

    const team      = req.params.team;
    const filter    = team.replace(/-/g, ' ');

    Transfer.find({ teamIn: filter })

        .then(results => {

            res.json(results);

        })

        .catch((error) => next(error));

};

exports.getTransfersByTeamOut = (req, res, next) => {

    const team      = req.params.team;
    const filter    = team.replace(/-/g, ' ');

    Transfer.find({ teamOut: filter })

        .then(results => {

            res.json(results);

        })

        .catch((error) => next(error));

};