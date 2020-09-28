//

const fetch = require('node-fetch');

// Get transfers from teams

exports.transfers = async (id, url, key) => {

    const teamTransfers = await fetch(`https://${url}/v2/transfers/team/${id}`, {
        "method": "GET",
        "headers": {
            "x-rapidapi-host": url,
            "x-rapidapi-key": key,
            "useQueryString": true
        }
    });

    return await teamTransfers.json();

}

// Get teams from leagues

exports.teams = async (id, url, key) => {

    const teamData = await fetch(`https://${url}/v2/teams/league/${id}`, {
        "method": "GET",
        "headers": {
            "x-rapidapi-host": url,
            "x-rapidapi-key": key,
            "useQueryString": true
        }
    });

    return await teamData.json();

};