//

require('dotenv').config();

const mongoose      = require('mongoose');
const fetch         = require('node-fetch');
const Team          = require('../server/models/team');
const Transfer      = require('../server/models/transfer');
const LastUpdated   = require('../server/models/date');

const apiURL        = process.env.API_LIVE;

let current;

process.argv.length > 3
    ? current = `${process.argv[2]} ${process.argv[3]}`
    : current = `${process.argv[2]}`

// Get transfers from teams

const getTransfers = async (id) => {

    const teamTransfers = await fetch(`https://${apiURL}/v2/transfers/team/${id}`, {
        "method": "GET",
        "headers": {
            "x-rapidapi-host": apiURL,
            "x-rapidapi-key": process.env.API_KEY,
            "useQueryString": true
        }
    });

    return await teamTransfers.json();

}

// Check dates

const daysBetween = (d1, d2) => {

    const result = Math.abs(d1.getTime() - d2.getTime());

    return Math.floor(result / (1000 * 60 * 60 * 24));

};

// Check for data issues

const checkData = (current) => {

    if (!current.type || current.type === 'N/A' || current.player_name === 'Data not available') {

        return true;

    }

    else if (!current.team_in.team_name || !current.team_out.team_name) {

        return true;

    }

    else if (!current.team_in.team_id || !current.team_out.team_id) {

        return true;

    }

    else {

        return false;

    }

}

// Check if transfer passes import requirements

const doesItPass = (current, count) => {

    const d1    = new Date();
    const d2    = new Date(current.transfer_date);
    const date  = daysBetween(d1, d2);
    const data  = checkData(current);

    if (count < 50) {

        if (current.transfer_date.includes('-')) {        

            if (date > 30 || date <= 0) {

                return 'Not relevant';
        
            }

            else if (data) {

                return 'Incomplete data';

            }

            else {

                return false;

            }
    
        } else {

            return 'Incorrect date format'

        }
        
    } else {

        return 'Transfer limit';

    }

}

// Add transfers to MongoDB

const pullTransfers = async () => {

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
                        
                        const team = await getTransfers(t.teamID);

                        if (team.api && team.api.results > 0) {

                            let transferPromise = Promise.resolve();
                            let count           = 0;

                            //

                            Promise.all(team.api.transfers.map(p => {

                                transferPromise = transferPromise.then(() => {

                                    return p;

                                }).then(async p => {


                                    let conditions = doesItPass(p, count);

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
                                
                                        });
                
                                    } else {

                                        console.log('❌',` Transfer not eligible: ${p.player_name} (${conditions})`);

                                    }

                                })

                                return transferPromise;

                            })).then(results => {

                                console.log('👕',` ${count} Transfers added for: ${t.name}`);
                                console.log('--------------------------------');

                            })


                        } else {

                            console.log('0️⃣',` No transfers available for ${t.name}`);

                        }

                    });

                    return teamPromise;

                })).then(results => {

                    setTimeout(() => {

                        console.log('--------------------------------');
                        console.log('⚽️',` ${transfers.length} Transfers added`);
                        console.log('✅',' Disconnected from MongoDB');
                        mongoose.connection.close();

                    }, 5000);

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

const updateDate = async () => {

    LastUpdated.find({})

        .then(result => {

            const newDate = new Date();

            LastUpdated.updateOne({ _id: result[0]._id }, { date: newDate }).then(result => {

                console.log('--------------------------------');
                console.log('🗓',' Updated date');
    
            });

        })

}

// Connect to MongoDB

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })

    .then(res => {

        console.log('--------------------------------');
        console.log('✅', ' Connected to MongoDB');
        console.log('--------------------------------');

        updateDate();
        pullTransfers();

    })
    .catch((error) => {

        console.log('--------------------------------');
        console.log('❌', ` Error connecting to MongoDB: ${error.message}`);
        console.log('--------------------------------');

    })

//