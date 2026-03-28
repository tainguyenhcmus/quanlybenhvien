// backend/routes/phongkham.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const controller = require('../controllers/phongkham.controller');

router.get('/', auth, controller.layTatCaPhongKham);

module.exports = router;
