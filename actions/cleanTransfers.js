//

require('dotenv').config();

const mongoose      = require('mongoose');

const Transfer      = require('../server/models/transfer');

const condition     = require('./functions/conditions');
const date          = new Date();

//

const isDuplicate = (array, item) => {

    let c = 0;

    //

    let name = array.filter(x => x.name === item.name);
    let date = array.filter(x => x.date === item.date);
    let team = array.filter(x => x.in === item.in);
    let type = array.filter(x => x.type === item.type);

    name && name.length > 1 ? c = c + 1 : c = c;
    date && date.length > 1 ? c = c + 1 : c = c;
    team && team.length > 1 ? c = c + 1 : c = c;
    type && type.length > 1 ? c = c + 1 : c = c;

    if (c === 4) { return true } else { return false };

}

const removeDuplicates = () => {

    let transfers   = [];
    let duplicates  = [];
    let dtPromise   = Promise.resolve();

    try {

        Transfer.find({})

            .then(async result => {

                Promise.all(result.map(t => {

                    dtPromise = dtPromise.then(() => {

                        return t;

                    }).then(async t => {

                        let c = isDuplicate(transfers, t);

                        c ? duplicates.push(t) : transfers.push(t);

                    })

                    return dtPromise;

                })).then(results => {

                    if (duplicates.length > 0) {

                        duplicates.forEach(t => {

                            Transfer.findByIdAndDelete(t._id)
    
                                .then(result => console.log('🗑',` Transfer removed: ${t.name}`))
                                .then(result => mongoose.connection.close())

                        })

                    } else {

                        console.log('No duplicates found');
                        mongoose.connection.close();

                    }

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

        removeDuplicates();

    })
    .catch((error) => {

        console.log('--------------------------------');
        console.log('❌', ` Error connecting to MongoDB: ${error.message}`);
        console.log('--------------------------------');

    })

//