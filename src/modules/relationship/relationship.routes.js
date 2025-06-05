const express = require('express');
const router = express.Router();
const {
  getAllRelationships,
  createRelationship,
  updateRelationship,
  deleteRelationship,
  getPersonRelationships
} = require('./relationship.controller');

const auth = require('../../middleware/auth');

// GET /api/relationships - Get all relationships
router.get('/', getAllRelationships);

// POST /api/relationships - Create new relationship
router.post('/', auth, createRelationship);

// PUT /api/relationships/:id - Update relationship
router.put('/:id', auth, updateRelationship);

// DELETE /api/relationships/:id - Delete relationship
router.delete('/:id', auth, deleteRelationship);

// GET /api/relationships/person/:personId - Get all relationships for a person
router.get('/person/:personId', getPersonRelationships);

module.exports = router;