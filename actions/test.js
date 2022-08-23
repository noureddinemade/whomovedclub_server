//

require('dotenv').config();

const mongoose  = require('mongoose');
const Team      = require('../server/models/team');

const test = async () => {

    const t = {

        teamID: 1,
        name: 'Scooby Doo',
        country: 'Cartoon Network',
        league: 'Funsies',
        logo: 'LOGO'
    
    };

    await Team.create(t).then(result => {
    
        console.log('✔️',` Team added: ${t.name}`);

    });

}



// Connect to MongoDB

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })

    .then(res => {

        console.log('--------------------------------');
        console.log('✅',' Connected to MongoDB');
        console.log('--------------------------------');

        test();

    })
    .catch((error) => {

        console.log('--------------------------------');
        console.log('❌',` Error connecting to MongoDB: ${error.message}`);
        console.log('--------------------------------');

    })

//