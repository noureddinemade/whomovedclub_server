//

const helper = require('./helpers.js');

// Check if transfer passes import requirements

exports.doesItPass = (current, count) => {

    const d1    = new Date();
    const d2    = new Date(current.transfer_date);
    const date  = helper.date(d1, d2);
    const data  = helper.check(current);

    if (count < 50) {

        if (current.transfer_date.includes('-')) {        

            if (date > 14 || date <= 0) {

                return 'Not relevant';
        
            }

            else if (data) {

                return 'Incomplete data';

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