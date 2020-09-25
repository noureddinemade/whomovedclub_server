//

const { Router }            = require('express');
const dateController        = require('../controllers/date');
const router                = Router();

router.get('/', dateController.getLastUpdated);

module.exports = router;