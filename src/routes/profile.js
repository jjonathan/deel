var router = require('express').Router()
const { Op } = require("sequelize")
const { getProfile } = require('../middleware/getProfile')

router.get('/:id', getProfile, async (req, res) => {
    const { Profile } = req.app.get('models')
    const { id } = req.params
    const profile = await Profile.findOne({
        where: { id: id }
    })
    if (!profile) return res.status(404).end()
    res.json(profile)
})

module.exports = router