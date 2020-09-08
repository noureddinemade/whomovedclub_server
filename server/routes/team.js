//

const { Router }            = require('express');
const teamController        = require('../controllers/team');
const router                = Router();

router.get('/', teamController.getAllTeams);
router.get('/league/:league', teamController.getTeamsByLeague);

module.exports = router;