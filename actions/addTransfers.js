//

require('dotenv').config();

const mongoose      = require('mongoose');

const Team          = require('../server/models/team');
const Transfer      = require('../server/models/transfer');
const LastUpdated   = require('../server/models/date');

const get           = require('./functions/requests');
const con           = require('./functions/conditions');

const apiURL        = process.env.API_LIVE;
const apiKey        = process.env.API_KEY;

const date          = new Date;
const today         = date.getDay();

//

let leagues;
let total = { yes: 0, no: 0 };

//

today === '0' || today === '1' || today === '3' || today === '5'
    ? leagues = ['Premier League', 'Bundesliga', 'Ligue 1', 'Serie A', 'La Liga']
    : today === '2' ? leagues = ['Eredivisie', 'Brasileiro', 'Primeira Liga', 'MLS', 'Liga MX']
    : today === '4' ? leagues = ['Scottish Premiership']
    : leagues = ['Premier League', 'Bundesliga', 'Ligue 1', 'Serie A', 'La Liga']


// Pull transfers from API

const pullTransfers = async (current) => {

    let teamPromise = Promise.resolve();
    let transfers   = [];

    try {

        // Get teams by league from MongoDB

        Team.find({ league: current })

            .then(async result => {

                Promise.all(result.map(t => {

                    teamPromise = teamPromise.then(() => {

                        return t;

                    }).then(async t => {
                        
                        const team = await get.transfers(t.teamID, apiURL, apiKey);

                        if (team.api && team.api.results > 0) {

                            let transferPromise = Promise.resolve();
                            let count           = 0;

                            //

                            Promise.all(team.api.transfers.map(p => {

                                transferPromise = transferPromise.then(() => {

                                    return p;

                                }).then(async p => {


                                    let conditions = con.doesItPass(p, count);

                                    //

                                    if (!conditions) {
                
                                        const transfer = {

                                            name: p.player_name,
                                            type: p.type,
                                            team: { 
                                                in: { 
                                                    id: p.team_in.team_id,
                                                    name: p.team_in.team_name 
                                                },
                                                out: { 
                                                    id: p.team_out.team_id, 
                                                    name: p.team_out.team_name 
                                                }
                                            },
                                            transferDate: p.transfer_date,
                                            lastUpdated: new Date()
                            
                                        };
                
                                        transfers.push(transfer);
                                        count = count + 1;
                
                                        await Transfer.create(transfer).then(result => {
                    
                                            console.log('✔️',` Transfer added: ${p.player_name}`);
                                            total.yes = total.yes + 1;
                                
                                        });
                
                                    } else {

                                        console.log('❌',` Transfer not eligible: ${p.player_name} (${conditions})`);

                                        total.no = total.no + 1;

                                    }

                                })

                                return transferPromise;

                            })).then(results => {

                                console.log('👕',` ${count} Transfers added for: ${t.name}`);
                                console.log('--------------------------------');

                            })


                        } else {

                            console.log('0️⃣',` No transfers available for ${t.name}`);
                            console.log('--------------------------------');

                        }

                    });

                    return teamPromise;

                })).then(results => {

                    setTimeout(() => {

                        console.log('⚽️',` ${transfers.length} Transfers added for ${current}`);
                        console.log('--------------------------------');

                    }, 500);

                })

            })

    }
    catch (error) {

        console.log('--------------------------------');
        console.log('❌',` Error: ${error.message}`);
        console.log('--------------------------------');
        mongoose.connection.close();

    }

}

// Update last updated date & time

const updateDate = async () => {

    LastUpdated.find({})

        .then(result => {

            const newDate = new Date();

            LastUpdated.updateOne({ _id: result[0]._id }, { date: newDate }).then(result => {

                console.log('🗓',' Updated date');
                console.log('--------------------------------');
    
            });

        })

}

// Loop thru all leagues and pull transfers

const getFromAllLeagues = (leagues) => {

    let wait = 0;

    leagues.map((l,i) => {

        setTimeout(() => {

            console.log('⌛️',` Adding Transfers in ${l}`);
            console.log('--------------------------------');
            setTimeout(() => pullTransfers(l), 500);

        }, wait);

        //

        if (i === leagues.length - 1) {

            setTimeout(() => {

                console.log('⚽️',' Transfer sync complete');
                console.log('✅',` ${total.yes} Transfer were added`);
                console.log('❌',` ${total.no} Transfer were ineligible`);
                console.log('--------------------------------');
                console.log('🔌',' Disconnected from MongoDB');
                mongoose.connection.close();

            }, wait * 2)

        }

        wait = wait + 120000;

    });

}


// Connect to MongoDB

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })

    .then(res => {

        console.log('--------------------------------');
        console.log('✅', ' Connected to MongoDB');
        console.log('--------------------------------');

        updateDate();
        setTimeout(() => getFromAllLeagues(leagues), 1000)
        

    })
    .catch((error) => {

        console.log('--------------------------------');
        console.log('❌', ` Error connecting to MongoDB: ${error.message}`);
        console.log('--------------------------------');

    })

//