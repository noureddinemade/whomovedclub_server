//

const mongoose  = require('mongoose');

//

const transferSchema = new mongoose.Schema({

    date:   String,
    name:   String,
    type:   String,
    in:     String,
    out:    String,

});

transferSchema.set('toJSON', {

    transform: (document, returnedObject) => {

        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v

    }

});

//

module.exports = mongoose.model('Transfer', transferSchema);