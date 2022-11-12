var router = require('express').Router()
const { Op } = require("sequelize")
const {getProfile} = require('../middleware/getProfile')

router.get('/:id',getProfile ,async (req, res) =>{
    const {Contract} = req.app.get('models')
    const {id} = req.params
    const contract = await Contract.findOne({
        where: {
            [Op.and]: [
                {id: id},
                {
                    [Op.or]: [
                        {ClientId: req.get('profile_id')},
                        {ContractorId : req.get('profile_id')}
                    ]
                }
            ]
        }
    })
    if(!contract) return res.status(404).end()
    res.json(contract)
})

router.get('/',getProfile ,async (req, res) =>{
    const {Contract} = req.app.get('models')
    const contracts = await Contract.findAll({
        where: {
            [Op.and]: [
                {status: {[Op.not]: 'terminated'}},
                {
                    [Op.or]: [
                        {ClientId: req.get('profile_id')},
                        {ContractorId : req.get('profile_id')}
                    ]
                }
            ]
        }
    })
    if(!contracts) return res.status(404).end()
    res.json(contracts)
})

module.exports = router