// Check dates

exports.date = (d1, d2) => {

    const result = Math.abs(d1.getTime() - d2.getTime());

    return Math.floor(result / (1000 * 60 * 60 * 24));

};

// Check for data issues

exports.check = (p, t) => {

    if (!t.type || t.type === 'N/A' || !p.player.name || p.player.name === 'Data not available') {

        return true;

    }

    else if (!t.teams.in.name || !t.teams.out.name) {

        return true;

    }

    else if (!t.teams.in.id || !t.teams.in.id) {

        return true;

    }

    else {

        return false;

    }

}

// Check for duplicates

exports.duplicate = (t,data) => {

    let c1      = data.find(i => i.in === t.teams.out.name);
    let c2      = data.find(i => i.out === t.teams.in.name);
    let c3      = data.find(i => i.date === t.date);
    let result  = 0;

    c1 ? result = result + 1 : result = result;
    c2 ? result = result + 1 : result = result;
    c3 ? result = result + 2 : result = result;

    if (result >= 3) { return true } else { return false };

}