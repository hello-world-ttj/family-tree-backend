const Campaign = require('./campaign.model');

// Middleware to check and update campaign status based on deadline and donated amount
const updateCampaignStatus = async () => {
  const campaigns = await Campaign.find({ status: 'Active' });
  const currentDate = new Date();

  for (const campaign of campaigns) {
    // Check if deadline is passed
    if (currentDate > campaign.deadline) {
      if (campaign.donatedAmount >= campaign.targetAmount) {
        // Close campaign if target is met
        campaign.status = 'Transferred';
      } else {
        // Extend deadline by 7 days if target not met
        campaign.deadline = new Date(campaign.deadline.getTime() + 7 * 24 * 60 * 60 * 1000);
      }
      await campaign.save();
    }
  }
};

exports.getAllCampaigns = async (req, res) => {
  try {
    // Update campaign statuses before fetching
    await updateCampaignStatus();
    const campaigns = await Campaign.find()
      .populate('doatedMembers.member')
      .sort({ createdAt: -1 });
    res.status(200).json(campaigns);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching campaigns', error: error.message });
  }
};

exports.createCampaign = async (req, res) => {
  try {
    const { reason, targetAmount, deadline, tagType } = req.body;

    // Validate required fields
    if (!reason || !targetAmount || !deadline || !tagType) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const campaign = new Campaign({
      reason,
      targetAmount,
      deadline,
      tagType,
    });
    await campaign.save();
    res.status(201).json(campaign);
  } catch (error) {
    res.status(500).json({ message: 'Error creating campaign', error: error.message });
  }
};

exports.donateToCampaign = async (req, res) => {
  try {
    const { amount, memberId } = req.body;
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    if (campaign.status !== 'Active') {
      return res.status(400).json({ message: 'Campaign is not active' });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid donation amount' });
    }

    // Add donation
    campaign.doatedMembers.push({
      member: memberId,
      amount,
    });
    campaign.donatedAmount += amount;

    // Check if target amount is reached
    if (campaign.donatedAmount >= campaign.targetAmount) {
      campaign.status = 'Transferred';
    }

    await campaign.save();
    res.status(200).json(campaign);
  } catch (error) {
    res.status(500).json({ message: 'Error donating to campaign', error: error.message });
  }
};

exports.getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id).populate('doatedMembers.member');
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    // Update status before returning
    await updateCampaignStatus();
    res.status(200).json(campaign);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching campaign', error: error.message });
  }
};

exports.updateCampaign = async (req, res) => {
  try {
    const { reason, targetAmount, deadline, tagType } = req.body;
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    if (campaign.status !== 'Active') {
      return res.status(400).json({ message: 'Cannot update inactive campaign' });
    }

    // Update only provided fields
    if (reason) campaign.reason = reason;
    if (targetAmount) campaign.targetAmount = targetAmount;
    if (deadline) campaign.deadline = deadline;
    if (tagType) campaign.tagType = tagType;

    await campaign.save();
    res.status(200).json(campaign);
  } catch (error) {
    res.status(500).json({ message: 'Error updating campaign', error: error.message });
  }
};

exports.deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    await campaign.deleteOne();
    res.status(200).json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting campaign', error: error.message });
  }
};