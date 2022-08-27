//

const Team = require('../models/team');

//

exports.getAllTeams = (req, res, next) => {

    Team.find({})

        .then(results => {

            res.json(results);

        })

        .catch((error) => next(error));

};

// Get teams by league

exports.getTeamsByLeague = (req, res, next) => {

    const league    = req.params.league;
    const filter    = league.replace(/-/g, ' ');

    Team.find({ league: filter })

        .then(results => {

            res.json(results);

        })

        .catch((error) => next(error));

};

exports.getTeamsByCountry = (req, res, next) => {

    const country = req.params.country;

    Team.find({ country: country })

        .then(results => {

            res.json(results);

        })

        .catch((error) => next(error));

};