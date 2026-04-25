const express = require('express');
const router = express.Router();

const { login, register, getMe } = require('../controllers/authController');
const { getFields, getField, createField, updateField, deleteField, getFieldUpdates } = require('../controllers/fieldsController');
const { getUsers, getAgents, createUser, deleteUser } = require('../controllers/usersController');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Auth
router.post('/auth/login', login);
router.post('/auth/register', register);
router.get('/auth/me', authenticate, getMe);

// Fields
router.get('/fields', authenticate, getFields);
router.post('/fields', authenticate, requireAdmin, createField);
router.get('/fields/:id', authenticate, getField);
router.patch('/fields/:id', authenticate, updateField);
router.delete('/fields/:id', authenticate, requireAdmin, deleteField);
router.get('/fields/:id/updates', authenticate, getFieldUpdates);

// Users (admin only)
router.get('/users', authenticate, requireAdmin, getUsers);
router.get('/users/agents', authenticate, requireAdmin, getAgents);
router.post('/users', authenticate, requireAdmin, createUser);
router.delete('/users/:id', authenticate, requireAdmin, deleteUser);

module.exports = router;
