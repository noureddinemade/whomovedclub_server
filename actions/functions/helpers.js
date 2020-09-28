// Check dates

exports.date = (d1, d2) => {

    const result = Math.abs(d1.getTime() - d2.getTime());

    return Math.floor(result / (1000 * 60 * 60 * 24));

};

// Check for data issues

exports.check = (current) => {

    if (!current.type || current.type === 'N/A' || current.player_name === 'Data not available') {

        return true;

    }

    else if (!current.team_in.team_name || !current.team_out.team_name) {

        return true;

    }

    else if (!current.team_in.team_id || !current.team_out.team_id) {

        return true;

    }

    else {

        return false;

    }

}