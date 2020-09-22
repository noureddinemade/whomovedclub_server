//

const mongoose  = require('mongoose');

//

const transferSchema = new mongoose.Schema({

    name: String,
    type: String,
    team: { 
        in: { id: Number, name: String },
        out: { id: Number, name: String }
    },
    transferDate: String,
    lastUpdated: Date

});

transferSchema.set('toJSON', {

    transform: (document, returnedObject) => {

        // returnedObject.id = returnedObject._id.toString()
        // delete returnedObject._id
        delete returnedObject.__v

    }

});

//

module.exports = mongoose.model('Transfer', transferSchema);