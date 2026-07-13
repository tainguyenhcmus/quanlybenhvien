const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const controller = require('../controllers/thongbao.controller');

router.get('/', auth, controller.layThongBao);
router.get('/chua-doc', auth, controller.demChuaDoc);
router.put('/doc-tat-ca', auth, controller.danhDauTatCaDaDoc);
router.put('/:id/doc', auth, controller.danhDauDaDoc);

module.exports = router;
