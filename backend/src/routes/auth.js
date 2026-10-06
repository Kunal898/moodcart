const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Public auth routes with auto-approval
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/auto-approve', authController.autoApprove);
router.post('/approve-all', authController.approveAllUsers);

module.exports = router;
