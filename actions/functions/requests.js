//

const fetch = require('node-fetch');

// Get transfers from teams

exports.transfers = async (id, url, key) => {

    const teamTransfers = await fetch(`https://api-football-v1.p.rapidapi.com/v3/transfers?team=${id}`, {
        "method": "GET",
        "headers": {
            "x-rapidapi-host": url,
            "x-rapidapi-key": key,
            "useQueryString": true
        }
    });

    return await teamTransfers.json();

}