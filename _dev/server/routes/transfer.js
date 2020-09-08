//

const { Router }            = require('express');
const transferController    = require('../controllers/transfer');
const router                = Router();

router.get('/', transferController.getAllTransfers);
router.get('/league/:league', transferController.getTransfersByLeague);
router.get('/team/:team', transferController.getTransfersByTeam);
router.get('/team/:team/in', transferController.getTransfersByTeamIn);
router.get('/team/:team/out', transferController.getTransfersByTeamOut);
router.get('/limit=:limit', transferController.getTransfersByLimit);

module.exports = router;