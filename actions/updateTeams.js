//

require('dotenv').config();

const mongoose      = require('mongoose');

const Team          = require('../server/models/team');

// Update last updated date & time

const updateTeams = async () => {

    Team.find({ league: 'MLS' })

        .then(result => {

            result.map(t => {

                Team.updateOne({ name: t.name }, { country: 'America' }).then(result => {

                    console.log('✅',` Updated ${t.name}`);
                    console.log('--------------------------------');
        
                });

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