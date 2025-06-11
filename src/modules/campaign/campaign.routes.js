const express = require('express');
const router = express.Router();
const campaignController = require('./campaign.controller');

router.get('/', campaignController.getAllCampaigns);
router.post('/', campaignController.createCampaign);
router.post('/:id/donate', campaignController.donateToCampaign);

module.exports = router;