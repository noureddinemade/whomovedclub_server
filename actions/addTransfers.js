//

require('dotenv').config();

const mongoose      = require('mongoose');

const apiURL        = process.env.API_LIVE;
const apiKEY        = process.env.API_KEY;

const Team          = require('../server/models/team');
const Transfer      = require('../server/models/transfer');
const LastUpdated   = require('../server/models/date');

const get           = require('./functions/requests');

const condition     = require('./functions/conditions');

const date          = new Date();
const currentYear   = date.getFullYear();

let total = { yes: 0, no: 0 };
let count = 0;
let leagues = [];


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

// Get transfers from Team

const pullTransfersFromTeam = async (currentTeam) => {

    let transferPromise = Promise.resolve();

    try {

        //

        const team       = await get.transfers(currentTeam, apiURL, apiKEY);
        const result     = team.response;

        Promise.all(result.map(item => {

            transferPromise = transferPromise.then(() => {
        
                return item;
        
            }).then(async item => {
        
                item.transfers.map(t => {                 

                    let transferDate    = new Date(t.date);
                    let transferYear    = transferDate.getFullYear();
                    let transfers       = [];

                    if (transferYear === currentYear) {

                        let status = condition.doesItPass(item, t, count, transfers);

                        if (!status) {

                            let cleanName   = item.player.name.replace('&apos;', "'");
                            let cleanType   = t.type.replace('€ ', '');
                                cleanType   = cleanType.toLowerCase();

                            let transfer = {
    
                                date:   t.date,
                                name:   cleanName,
                                type:   cleanType,
                                in:     t.teams.in.name,
                                out:    t.teams.out.name
        
                            }

                            transfers.push(transfer);

                            Transfer.create(transfer).then(result => {
                    
                                console.log('✓',` Transfer added: ${item.player.name}`);
                                total.yes = total.yes + 1;
                    
                            });

                        }

                        else {

                            console.log('❌', ` Not added: ${item.player.name} - ${status}`);
                            total.no = total.no + 1;

                        }

                    }
        
                });
        
            })
        
            return transferPromise;
            
        }))

    }
    
    catch (error) {

        console.log('--------------------------------');
        console.log('❌',` Error: ${error.message}`);
        console.log('--------------------------------');
        mongoose.connection.close();

    }

}

// Get Team IDs from a league

league = process.argv[2];

const pullTeamsFromLeague = async (league, total) => {

    console.log('--------------------------------');
    console.log('⌛️',` Adding Transfers in ${league}`);
    console.log('--------------------------------');

    Team.find({ league: league })

    .then(async results => {

        let teamPromise = Promise.resolve();

        await Promise.all(results.map(team => {

            teamPromise = teamPromise.then(() => {

                return team;

            }).then (async team => {

                pullTransfersFromTeam(team.teamID);

            })

        })).then(async results => {
        
            await setTimeout(() => {
        
                console.log('--------------------------------');
                console.log('--------------------------------');
                console.log('--------------------------------');
                console.log('⚽️',' Transfer sync complete');
                console.log('✅',` ${total.yes} Transfer were added`);
                console.log('❌',` ${total.no} Transfer were ineligible`);
                console.log('--------------------------------');
                console.log('🔌',' Disconnected from MongoDB');
                mongoose.connection.close();
        
            }, 10000);
        
        })

    })

}

// Connect to MongoDB

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })

    .then(res => {

        console.log('--------------------------------');
        console.log('✅',' Connected to MongoDB');
        console.log('--------------------------------');

        pullTeamsFromLeague(league, total);
        updateDate();

    })

    .catch((error) => {

        console.log('--------------------------------');
        console.log('❌',` Error connecting to MongoDB: ${error.message}`);
        console.log('--------------------------------');
        mongoose.connection.close();

    })

//