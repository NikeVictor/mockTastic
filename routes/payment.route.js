const express = require('express');
const paymentController = require('../controller/payment.controller');
const router = express.Router();

router.post("/create-payment", paymentController.createPayment);
router.get("/success", paymentController.success);
router.get("/cancel", paymentController.cancel);

module.exports = router;