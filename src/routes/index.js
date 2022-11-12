var router = require('express').Router();

router.use('/contracts', require('./contracts'));
router.use('/jobs', require('./jobs'));

module.exports = router;