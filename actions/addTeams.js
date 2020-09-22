//

require('dotenv').config();

const mongoose  = require('mongoose');
const fetch     = require('node-fetch');
const Team      = require('../server/models/team');

const leagueList = {

    test: {

        id: 524,
        name: 'Premier League'

    },

    eng: {
        id: 2790,
        name: 'Premier League'
    },

    ger: {
        id: 2755,
        name: 'Bundesliga'
    },

    fra: {
        id: 2664,
        name: 'Ligue 1'
    },

    ita: {
        id: 891,
        name: 'Serie A'
    },

    spa: {
        id: 775,
        name: 'La Liga'
    },

    ned: {
        id: 0,
        name: 'Eredivisie'
    }

}

//

const current   = leagueList.eng;
const apiURL    = process.env.API_LIVE;

//

const isDuplicate = (current, teams) => {

    const nameMatch     = teams.filter(a => a.name === current.player_name);
    const idMatch       = teams.filter(a => a.id === current.team_id);

    if (nameMatch.length > 0) {

        if (idMatch.length > 0) {

            return 'Duplicate';

        }
        
        else {

            return false;

        }

    } else {

        return false;

    }

}

// Get teams from leagues

const getTeams = async (league) => {

    const teamData = await fetch(`https://${apiURL}/v2/teams/league/${league}`, {
        "method": "GET",
        "headers": {
            "x-rapidapi-host": apiURL,
            "x-rapidapi-key": process.env.API_KEY,
            "useQueryString": true
        }
    });

    return await teamData.json();

};

// Add teams to MongoDB

const pullTeams = async () => {

    let teamPromise = Promise.resolve();
    let teams       = [];

    try {

        //

        const league = await getTeams(current.id);
        const result = league.api.teams;

        Promise.all(result.map(t => {

            teamPromise = teamPromise.then(() => {

                return t;

            }).then(async t => {

                const conditions = isDuplicate(t, teams);

                if (!conditions) {

                    const leagueTeam = {

                        teamID: t.team_id,
                        name: t.name,
                        country: t.country,
                        league: current.name,
                        logo: t.logo
        
                    };
    
                    teams.push(leagueTeam);
    
                    await Team.create(leagueTeam).then(result => {
    
                        console.log('✔️',` Team added: ${t.name}`);
            
                    });

                } else {

                    console.log('❌',` Team not eligible: ${t.name} (${conditions})`);

                }

            })

            return teamPromise;
            
        })).then(results => {

            setTimeout(() => {

                console.log('--------------------------------');
                console.log('⚽️',' Teams import complete');
                console.log('✅',' Disconnected from MongoDB');
                mongoose.connection.close();

            }, 2500);

        })

    } catch (error) {

        console.log('--------------------------------');
        console.log('❌',` Error: ${error.message}`);
        console.log('--------------------------------');
        mongoose.connection.close();

    }

}

// Connect to MongoDB

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })

    .then(res => {

        console.log('--------------------------------');
        console.log('✅',' Connected to MongoDB');
        console.log('--------------------------------');

        pullTeams();

    })
    .catch((error) => {

        console.log('--------------------------------');
        console.log('❌',` Error connecting to MongoDB: ${error.message}`);
        console.log('--------------------------------');

    })

//