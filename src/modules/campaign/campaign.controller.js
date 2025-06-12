const Campaign = require('./campaign.model');

exports.getAllCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find().sort({ createdAt: -1 });
    res.status(200).json(campaigns);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching campaigns', error });
  }
};

exports.createCampaign = async (req, res) => {
  try {
    const { name, targetAmount, deadline, category, description, media } = req.body;
    const campaign = new Campaign({ name, targetAmount, deadline, category, description, media });
    await campaign.save();
    res.status(201).json(campaign);
  } catch (error) {
    res.status(500).json({ message: 'Error creating campaign', error });
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
    
    res.status(200).json(campaign);
  } catch (error) {
    res.status(500).json({ message: 'Error donating to campaign', error });
  }
};