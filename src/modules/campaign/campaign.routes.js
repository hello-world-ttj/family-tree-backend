const express = require('express');
const router = express.Router();
const campaignController = require('./campaign.controller');

// Routes for campaign management
router.get('/', campaignController.getAllCampaigns);
router.post('/', campaignController.createCampaign);
router.get('/:id', campaignController.getCampaignById);
router.put('/:id', campaignController.updateCampaign);
router.delete('/:id', campaignController.deleteCampaign);
router.post('/:id/donate', campaignController.donateToCampaign);

module.exports = router;