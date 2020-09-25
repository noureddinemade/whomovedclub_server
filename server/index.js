//

require('dotenv').config();

const express       = require('express');
const mongoose      = require('mongoose');
const path          = require('path');
const cluster       = require('cluster');
const numCPUs       = require('os').cpus().length;
const cors          = require('cors');
const { resolve }   = require('path');

const isDev         = process.env.NODE_ENV !== 'production';
const PORT          = process.env.PORT || 5000;
const url           = process.env.MONGODB_URI;

const app           = express();

const Transfer      = require('./models/transfer');
const Team          = require('./models/team');
const LastUpdated   = require('./models/date');

const transferRoutes    = require('./routes/transfer');
const teamRoutes        = require('./routes/team');
const dateRoutes        = require('./routes/date');

// Connect to MongoDB

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })

    .then(res => {

        console.log('Connected to MongoDB');

    })
    .catch((error) => {

        console.log('Error connecting to MongoDB:', error.message);

    })

//

if (!isDev && cluster.isMaster) {

    console.error(`Node cluster master ${process.pid} is running`);

    // Fork workers.
    for (let i = 0; i < numCPUs; i++) {

        cluster.fork();
        
    }

    cluster.on('exit', (worker, code, signal) => {

        console.error(`Node cluster worker ${worker.process.pid} exited: code ${code}, signal ${signal}`);

    });
  
  } else {

    app.use(express.json());
    app.use(cors());
    app.use(express.static(path.resolve(__dirname, '../client/build')));

    // API

    app.use('/transfers', transferRoutes);
    app.use('/teams', teamRoutes);
    app.use('/date', dateRoutes);

    // Add transfers.

    app.post('/transfer', (req, res) => {

        const body = req.body;

        if (body.name === undefined) {

            return res.status(400).json({ error: 'content missing' });

        }

        //

        const transfer = new Transfer({

            name:           body.name,
            type:           body.type,
            league:         body.league,
            teamIn:         body.teamIn,
            teamOut:        body.teamOut,
            transferDate:   body.transferDate,
            lastUpdated:    body.lastUpdated

        });

        transfer.save().then(t => {

            res.json(t)

        });

    });

    // Add teams.

    app.post('/team', (req, res) => {

        const body = req.body;

        if (body.name === undefined) {

            return res.status(400).json({ error: 'content missing' });

        }

        //

        const team = new Team({

            id:             body.id,
            name:           body.name,
            league:         body.league

        });

        team.save().then(t => {

            res.json(t)

        });

    });

    // Update last updated

    app.post('/date', (req, res) => {

        const body = req.body;

        if (body.date === undefined) {

            return res.status(400).json({ error: 'content missing' });

        }

        //

        const date = new LastUpdated({

            date: body.date

        });

        date.save().then(d => {

            res.json(d)

        });

    });    

    //

    app.get('*', function(request, response) {

        response.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));

    });

    app.listen(PORT, function () {

        console.error(`Node ${isDev ? 'dev server' : 'cluster worker '+process.pid}: listening on port ${PORT}`);

    });

};