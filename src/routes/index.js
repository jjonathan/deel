var router = require('express').Router();

router.use('/contracts', require('./contracts'));
router.use('/jobs', require('./jobs'));
router.use('/balances', require('./balances'));
router.use('/admin', require('./admin'));

//created to make more easier the debug process
router.use('/profile', require('./profile'));

module.exports = router;