const express = require('express');
const router = express.Router();
const {
  createMembershipRequest,
  getPendingRequests,
  reviewMembershipRequest
} = require('./request.controller');
const auth = require('../../middleware/auth');

// POST /api/requests - Create new membership request
router.post('/', auth, createMembershipRequest);

// GET /api/requests/pending - Get all pending requests (admin only)
router.get('/pending', auth,  getPendingRequests);

// PUT /api/requests/:id/review - Review membership request (admin only)
router.put('/:id/review', auth,  reviewMembershipRequest);

module.exports = router;