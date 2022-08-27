//

const mongoose = require('mongoose');

//

const teamSchema = new mongoose.Schema({

    teamID:         Number,
    name:           String,
    code:           String,
    country:        String,
    league:         String,
    logo:           String,
    venue:          String,

});

teamSchema.set('toJSON', {

    transform: (document, returnedObject) => {

        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v

    }

});

//

module.exports = mongoose.model('Team', teamSchema);