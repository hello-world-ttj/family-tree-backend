const express = require('express');
const router = express.Router();
const {
  getAllPersons,
  getPersonById,
  createPerson,
  updatePerson,
  deletePerson,
  getAncestryTree,
  getDescendantTree
} = require('./person.controller');

// Middleware for authentication (implement as needed)
const auth = require('../../middlewares/auth');

// GET /api/persons - Get all persons with pagination and search
router.get('/', getAllPersons);

// GET /api/persons/:id - Get person by ID with relationships
router.get('/:id', getPersonById);

// POST /api/persons - Create new person
router.post('/', auth, createPerson);

// PUT /api/persons/:id - Update person
router.put('/:id', auth, updatePerson);

// DELETE /api/persons/:id - Delete person
router.delete('/:id', auth, deletePerson);

// GET /api/persons/:id/ancestry - Get ancestry tree
router.get('/:id/ancestry', getAncestryTree);

// GET /api/persons/:id/descendants - Get descendant tree
router.get('/:id/descendants', getDescendantTree);

module.exports = router;