const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const controller = require('../controllers/lichsu.controller');

router.get('/', auth, controller.layLichSu);

module.exports = router;
