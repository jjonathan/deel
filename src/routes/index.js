var router = require('express').Router();

router.use('/contracts', require('./contracts'));

module.exports = router;