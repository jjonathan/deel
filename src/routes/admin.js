var router = require('express').Router()
const { Op } = require("sequelize")
const { getProfile } = require('../middleware/getProfile')
const { validateDateFormat } = require('../utils/dateUtil')

const getOrderedProfiles = async (req, type) => {
    const { Contract, Job, Profile } = req.app.get('models')
    const {start, end } = req.query
    const profiles = await Profile.findAll({
        include: [
            {
                required: true,
                model: Contract,
                as: type == 'contractor' ? 'Contractor' : 'Client',
                include: [
                    {
                        model: Job,
                        required: true,
                        where: {
                            paid: true,
                            paymentDate: { [Op.between] : [start, end]}
                        }
                    }
                ]
            },
        ],
        where: { type: type }
    })
    return profiles.map(profile => {
        paid = 0
        profileContract = type == 'contractor' ? profile.Contractor : profile.Client
        profileContract.forEach(contract => {
            contract.Jobs.forEach(job => {
                paid += job.price
            });
        });
        return {
            'id': profile.id,
            'fullName': `${profile.firstName} ${profile.lastName}`,
            'paid': paid
        }
    }).sort((a, b) => b.paid - a.paid)
}

router.get('/best-clients', getProfile, async (req, res) => {
    // Returns the profession that earned the most money (sum of jobs paid) 
    // for any contactor that worked in the query time range.

    const {start, end, limit } = req.query
    const startIsValid = await validateDateFormat(start)
    const endIsValid = await validateDateFormat(end)
    if (!startIsValid || !endIsValid) return res.status(400).send('Date is on the wrong type (yyyymmdd)').end()
    if (end < start) return res.status(400).send('End is lower then Start date').end()


    profilesOrdered = await getOrderedProfiles(req, 'client')
    Promise.all(profilesOrdered).then(() => {
        if (limit > 0) res.json(profilesOrdered.slice(0,limit))
        res.json(profilesOrdered)
    })
})

router.get('/best-profession', getProfile, async (req, res) => {
    // Returns the profession that earned the most money (sum of jobs paid) 
    // for any contactor that worked in the query time range.

    const {start, end } = req.query
    const startIsValid = await validateDateFormat(start)
    const endIsValid = await validateDateFormat(end)
    if (!startIsValid || !endIsValid) return res.status(400).send('Date is on the wrong type (yyyymmdd)').end()
    if (end < start) return res.status(400).send('End is lower then Start date').end()


    profilesOrdered = await getOrderedProfiles(req, 'contractor')
    Promise.all(profilesOrdered).then(res.json(profilesOrdered))
})

module.exports = router