var router = require('express').Router()
const { Op } = require("sequelize")
const { getProfile } = require('../middleware/getProfile')
const { validateDateFormat } = require('../utils/dateUtil')

router.get('/best-profession', getProfile, async (req, res) => {
    // Returns the profession that earned the most money (sum of jobs paid) 
    // for any contactor that worked in the query time range.

    const { Contract, Job, Profile } = req.app.get('models')
    start = req.query.start
    end = req.query.end
    const startIsValid = await validateDateFormat(start)
    const endIsValid = await validateDateFormat(end)
    if (!startIsValid || !endIsValid) return res.status(400).send('Date is on the wrong type (yyyymmdd)').end()
    if (end < start) return res.status(400).send('End is lower then Start date').end()

    const profiles = await Profile.findAll({
        include: [
            {
                required: true,
                model: Contract,
                as: 'Contractor',
                include: [
                    {
                        model: Job,
                        required: true,
                        where: {paid: true}
                    }
                ]
            },
        ],
        where: { type:'contractor' }
    })
    profilesOrdered = profiles.map(profile => {
        paid = 0
        profile.Contractor.forEach(contract => {
            contract.Jobs.forEach(job => {
                paid += job.price
            });
        });
        return {
            'id': profile.id,
            'fullName': `${profile.firstName} ${profile.lastName}`,
            'paid': paid
        }
    }).sort((a,b) => b.paid - a.paid)

    Promise.all(profilesOrdered).then(res.json(profilesOrdered))
})

module.exports = router