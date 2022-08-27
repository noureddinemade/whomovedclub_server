//

const { Router }            = require('express');
const teamController        = require('../controllers/team');
const router                = Router();

router.get('/', teamController.getAllTeams);
router.get('/league/:league', teamController.getTeamsByLeague);
router.get('/country/:country', teamController.getTeamsByCountry);

module.exports = router;