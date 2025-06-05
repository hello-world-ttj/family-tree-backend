const express = require('express');
const router = express.Router();
const {
  getAllFamilies,
  getFamilyById,
  createFamily,
  updateFamily,
  deleteFamily,
  addFamilyMember,
  removeFamilyMember
} = require('./family.controller');

const auth = require('../../middleware/auth');

// GET /api/families - Get all families
router.get('/', getAllFamilies);

// GET /api/families/:id - Get family by ID
router.get('/:id', getFamilyById);

// POST /api/families - Create new family
router.post('/', auth, createFamily);

// PUT /api/families/:id - Update family
router.put('/:id', auth, updateFamily);

// DELETE /api/families/:id - Delete family
router.delete('/:id', auth, deleteFamily);

// POST /api/families/:id/members - Add member to family
router.post('/:id/members', auth, addFamilyMember);

// DELETE /api/families/:id/members/:personId - Remove member from family
router.delete('/:id/members/:personId', auth, removeFamilyMember);

module.exports = router;