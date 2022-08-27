//

const helper = require('./helpers.js');

// Check if transfer passes import requirements

exports.doesItPass = (p, t, count, data) => {

    const dateToday         = new Date();
    const dateTransfer      = new Date(t.date);
    const dateCheck         = helper.date(dateToday, dateTransfer);
    const dataCheck         = helper.check(p,t);
    const duplicateCheck    = helper.duplicate(t,data);

    if (count < 50) {

        if (t.date.includes('-')) {        

            if (dateCheck > 60 || dateCheck <= 0) {

                return 'Not relevant';
        
            }

            else if (dataCheck) {

                return 'Incomplete data';

            }

            else if (duplicateCheck === true) {

                return 'Duplicate Entry';

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