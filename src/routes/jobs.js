var router = require('express').Router()
const { Op } = require("sequelize")
const {getProfile} = require('../middleware/getProfile')
const { Profile } = require('../model')

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

router.post('/:job_id/pay',getProfile ,async (req, res) => {
    // Pay for a job, a client can only pay if his balance >= the amount to pay. 
    // The amount should be moved from the client's balance to the contractor balance.
    const {Contract, Job, Profile} = req.app.get('models')

    if (req.profile.type != 'client') res.status(401).send('Only client can pay for jobs').end()
    
    const jobId = req.params.job_id
    const contract = await Contract.findOne({
        include: [
            {
                required: true,
                model: Job,
                where: {id: jobId},
            },
            {
                model: Profile,
                as: 'Contractor'
            }
        ],
        where: Contract.queryContractByProfileId(req.get('profile_id'))
    })

    const job = contract.Jobs[0]

    if (!contract) return res.status(404).end()
    if (job.paid) return res.status(400).send('Job already paid').end()
    if (req.profile.balance < job.price) return res.status(400).send('There is not enough balance').end()

    const sequelize = req.app.get('sequelize')
    const t = await sequelize.transaction();
    try {
        req.profile.balance -= job.price
        await req.profile.save({transaction: t})
        contract.Contractor.balance += job.price
        await contract.Contractor.save({transaction: t})
        job.paid = true
        await job.save({transaction: t})
        t.commit()
    } catch (error) {
        t.rollback();
        res.status(500).send('Something goes wrong try again').end()
    }

    res.json({'contract': contract, 'client': req.profile})
})

module.exports = router