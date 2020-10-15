//

require('dotenv').config();

const mongoose  = require('mongoose');
const Transfer  = require('../server/models/transfer');

// Check transfer dates.

const daysBetween = function(d1, d2) {

    const result = Math.abs(d1.getTime() - d2.getTime());

    return Math.floor(result / (1000 * 60 * 60 * 24));

};

// Check if transfer is already in there

const isDuplicate = (current, players) => {

    const nameMatch             = players.filter(a => a.name === current.name);
    const lastLettersMatch      = players.filter(a => a.name.slice(-5) === current.name.slice(-5));
    const typeMatch             = players.filter(a => a.type === current.type);
    const teamInMatch           = players.filter(a => a.team.in.name === current.team.in.name);
    const teamOutMatch          = players.filter(a => a.team.out.name === current.team.out.name);
    const dateMatch             = players.filter(a => a.transferDate === current.transferDate);

    if (typeMatch.length > 1) {

        if (dateMatch.length > 1) {

            if (teamInMatch.length > 1 && teamOutMatch.length > 1) {

                return true;
    
            } else if (nameMatch.length > 1 && lastLettersMatch.length > 1) {

                return true;

            } else {

                return false;

            }

        } else {

            return false;

        }

    } else {

        return false;

    }

}

// Check if transfer passes import requirements

const doesItPass = (current, players) => {

    const d1    = new Date();
    const d2    = new Date(current.transferDate);
    const date  = daysBetween(d1, d2);

    if (date > 60) {

        return 'old';

    } else {

        if (isDuplicate(current, players)) {

            return 'duplicate';
    
        }
    
        else {
    
            return false;
    
        }

    }

}

//

const cleanTransfers = async () => {

    let removePromise   = Promise.resolve();
    let toBeRemoved     = [];
    let unique          = [];

    try {

        Transfer.find({})

            .then(async result => {

                Promise.all(result.map(t => {

                    removePromise = removePromise.then(() => {

                        return t;

                    }).then(async t => {

                        const conditions = doesItPass(t, result);

                        if (conditions === 'old') {
                            
                            toBeRemoved.push(t);

                        }

                        else if (conditions === 'duplicate') {

                            const date      = unique.filter(a => a.transferDate === t.transferDate);
                            const type      = unique.filter(a => a.type === t.type);
                            const teamIn    = unique.filter(a => a.team.in.id === t.team.in.id);
                            const teamOut   = unique.filter(a => a.team.out.id === t.team.out.id);

                            if (date.length > 0 && type.length > 0 && teamIn.length > 0 && teamOut.length > 0) {

                                toBeRemoved.push(t);

                            } else {

                                unique.push(t);

                            }

                        }
                        
                    })

                    return removePromise;

                })).then(results => {

                    toBeRemoved = toBeRemoved.sort();

                    if (toBeRemoved.length > 1) {

                        toBeRemoved.map(t => {

                            Transfer.findByIdAndDelete(t._id)
    
                                .then(result => console.log('🗑',` Transfer removed: ${t.name}`))
    
                        })

                    }

                    setTimeout(() => {

                        console.log('--------------------------------');
                        console.log('⚽️',` ${toBeRemoved.length}/${result.length} Transfers cleaned`);
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

// Connect to MongoDB

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })

    .then(res => {

        console.log('--------------------------------');
        console.log('✅', ' Connected to MongoDB');
        console.log('--------------------------------');

        cleanTransfers();

    })
    .catch((error) => {

        console.log('--------------------------------');
        console.log('❌', ` Error connecting to MongoDB: ${error.message}`);
        console.log('--------------------------------');

    })

//