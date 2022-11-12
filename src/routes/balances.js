var router = require('express').Router()
const { Op } = require("sequelize")
const { getProfile } = require('../middleware/getProfile')

router.post('/deposit/:amount', getProfile, async (req, res) => {
    // Deposits money into the the the balance of a client, 
    // a client can't deposit more than 25% his total of jobs to pay. (at the deposit moment)

    // Question: In the readme, its explain that the path parameter is userId, 
    // but the userId already is send in the header, so I have changed to amount
    const { Contract, Job } = req.app.get('models')
    let { amount } = req.params
    amount = parseFloat(amount)
    const sequelize = req.app.get('sequelize')
    if (req.profile.type != 'client') res.status(401).send('Only client can deposit').end()
    const jobPrice = await Job.findOne({
        include: [
            {
                attributes: [],
                required: true,
                model: Contract,
                where: Contract.queryContractByProfileId(req.get('profile_id'))
            }
        ],
        where: { paid: { [Op.not]: true } },
        attributes: [[sequelize.fn('SUM', sequelize.col('Job.price')), 'total']]
    })

    maxDepositAllowed = jobPrice.dataValues.total / 4
    if (amount > maxDepositAllowed) res.status(400).send(`Trying to deposit more then ${maxDepositAllowed}`).end()
    req.profile.balance += amount
    await req.profile.save()
    res.json(req.profile)
})

module.exports = router