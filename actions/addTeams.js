//

require('dotenv').config();

const mongoose  = require('mongoose');
const fetch     = require('node-fetch');
const Team      = require('../server/models/team');

const leagueList = {

    eng: {
        id: 39,
        name: 'Premier League'
    },

    ger: {
        id: 78,
        name: 'Bundesliga'
    },

    fra: {
        id: 61,
        name: 'Ligue 1'
    },

    ita: {
        id: 135,
        name: 'Serie A'
    },

    spa: {
        id: 140,
        name: 'La Liga'
    },

    ned: {
        id: 88,
        name: 'Eredivisie'
    },

    bra: {
        id: 71,
        name: 'Brasileiro'
    },

    por: {
        id: 94,
        name: 'Primeira Liga'
    },

    sco: {
        id: 180,
        name: 'Scottish Premiership'
    },

    usa: {
        id: 253,
        name: 'MLS'
    },

    mex: {
        id: 262,
        name: 'Liga MX'
    },
    arg: {
        id: 128,
        name: 'Primera Division'
    }

}

//

const current   = leagueList.arg;
const apiURL    = process.env.API_LIVE;

//

const isDuplicate = (current, teams) => {

    const nameMatch     = teams.filter(a => a.name === current.team.name);
    const idMatch       = teams.filter(a => a.id === current.team.id);

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

    const teamData = await fetch(`https://${apiURL}/v3/teams?league=${league}&season=2022`, {
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
        const result = league.response;

        Promise.all(result.map(t => {

            teamPromise = teamPromise.then(() => {

                return t;

            }).then(async t => {

                const conditions = isDuplicate(t, teams);

                if (!conditions) {

                    const leagueTeam = {
                
                        teamID:     t.team.id,
                        name:       t.team.name,
                        code:       t.team.code,
                        country:    t.team.country,
                        league:     current.name,
                        logo:       t.team.logo,
                        venue:      t.venue.name
                
                    };
                
                    teams.push(leagueTeam);
                
                    await Team.create(leagueTeam).then(result => {
                
                        console.log('✔️',` Team added: ${t.team.name}`);
                
                    });
                
                } else {
                
                    console.log('❌',` Team not eligible: ${t.team.name} (${conditions})`);
                
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