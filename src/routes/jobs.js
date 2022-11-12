var router = require('express').Router()
const { Op } = require("sequelize")
const {getProfile} = require('../middleware/getProfile')

router.get('/unpaid',getProfile ,async (req, res) => {
    const {Contract, Job} = req.app.get('models')
    const jobs = await Job.findAll({
        include: [
            {
                attributes: [],
                required: true,
                model: Contract,
                where: {
                    [Op.and]: [
                        {status: 'in_progress'},
                        Contract.queryContractByProfileId(req.get('profile_id'))
                    ]
                }
            }
        ],
        where: {
            paid: {[Op.not]: 'true'}
        }
    })
    if(!jobs) return res.status(404).end()
    res.json(jobs)
})

module.exports = router