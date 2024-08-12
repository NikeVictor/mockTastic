const Payment = require("../models/payment.model");
const paypal = require("../../paypal-config");
const Response = require("express").response;

module.exports = {
  createPayment: async (req, res) => {
    const items = [
      {
        name: "Product1", //product name
        sku: "001", //unique identifier for product (you can use _id from database)
        price: "10", //price
        currency: "USD", //currency
        quantity: 1, //quantity
      }
    ];

    const amount = {
      currency: "USD", //currency
      total: "10", //total amount
    };

    // Creating a payment data object

    const paymentData = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        return_url: "https://mocktastic.onrender.com/success", // if sucessfull return url
        cancel_url: "https://mocktastic.onrender.com/cancel", // if canceled return url
      },
      transactions: [
        {
          item_list: {
            items: items, // the items
          },
          amount: amount, // the amount
          description: "Payment using PayPal",
        },
      ],
    };
    // creating payment
    paypal.payment.create(paymentData, function (err, payment) {
      if (err) {
        throw err;
      } else {
        for (let i = 0; i < payment.links.length; i++) {
          if (payment.links[i].rel === "approval_url") {
            res.json({ forwardLink: payment.links[i].href });
            // res.redirect(payment.links[i].href)
          }
        }
      }
    });
  },

  success: async (req, res) => {
    const payerId = req.body.payerId;
    const paymentId = req.body.paymentId;
    const execute_payment_json = {
      payer_id: payerId
    };
  
    paypal.payment.execute(paymentId, execute_payment_json, async (error, payment) => {
      if (error) {
        console.error("PayPal Execution Error:", error.response);
        return res.status(500).send("Error executing payment: " + error.message);
      } else {
        try {
          const transaction = payment.transactions[0];
          const { total: amount, currency } = transaction.amount;
          const status = payment.state;
          const description = transaction.description;
          const customerEmail = payment.payer.payer_info.email;
  
          // Save payment details to MongoDB using Mongoose
          await Payment.create({
            payment_id: paymentId,
            payer_id: payerId,
            amount: parseFloat(amount),
            currency: currency,
            status: status,
            description: description,
            customer_email: customerEmail,
          });
  
          res.send("Payment successful and saved");
        } catch (dbError) {
          console.error("Database Insertion Error:", dbError);
          res.status(500).send("Payment processed but failed to save in database");
        }
      }
    });
  },

  cancel: async (req, res) => {
    res.send("Payment cancelled");
  },
};
