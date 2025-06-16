const Campaign = require('./campaign.model');
const response_handler = require('../../helpers/responseHandler');

exports.getAllCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find().sort({ createdAt: -1 });
    return response_handler(res, 200, 'Campaigns fetched successfully', campaigns);
  } catch (error) {
    return response_handler(res, 500, 'Error fetching campaigns', error);
  }
};

exports.createCampaign = async (req, res) => {
  try {
    const { name, targetAmount, deadline, category, description, media } = req.body;
    const campaign = new Campaign({ name, targetAmount, deadline, category, description, media });
    await campaign.save();
    return response_handler(res, 201, 'Campaign created successfully', campaign);
  } catch (error) {
    return response_handler(res, 500, 'Error creating campaign', error);
  }
};

exports.donateToCampaign = async (req, res) => {
  try {
    const { amount } = req.body;
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    
    campaign.raisedSoFar += amount;
    campaign.donors += 1;
    campaign.status = campaign.raisedSoFar >= campaign.targetAmount ? 'Transferred' : 'Active';
    await campaign.save();
    
    return response_handler(res, 200, 'Donation successful', campaign);
  } catch (error) {
    return response_handler(res, 500, 'Error donating to campaign', error);
  }
};