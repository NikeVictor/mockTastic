const express = require('express');
const paymentController = require('../controller/payment.controller');
const contactController = require('../controller/contact.controller');
const router = express.Router();

router.post("/create-payment", paymentController.createPayment);
router.post("/success", paymentController.success);
router.post("/cancel", paymentController.cancel);
router.post("/contact", contactController.contactUs);

module.exports = router;