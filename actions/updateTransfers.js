//

require('dotenv').config();

const mongoose      = require('mongoose');

const Transfer      = require('../server/models/transfer');

// Update last updated date & time

const updateTeams = async () => {

    Transfer.find({})

        .then(result => {

            result.map(t => {

                if (t.type) {

                    const type = t.type.toLowerCase();

                    Transfer.updateOne({ _id: t._id }, { type: type }).then(result => {

                        console.log('✅',` Updated ${t.name}`);
                        console.log('--------------------------------');

                    });

                }

            })

        })

}

// Connect to MongoDB

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })

    .then(res => {

        console.log('--------------------------------');
        console.log('✅', ' Connected to MongoDB');
        console.log('--------------------------------');

        updateTeams();
        

    })
    .catch((error) => {

        console.log('--------------------------------');
        console.log('❌', ` Error connecting to MongoDB: ${error.message}`);
        console.log('--------------------------------');

    })

//