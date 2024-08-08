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
        return_url: "http://localhost:3000/success", // if sucessfull return url
        cancel_url: "http://localhost:3000/cancel", // if canceled return url
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
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;

    const execute_payment_json = {
      payer_id: payerId,
      transactions: [
        {
          amount: {
            currency: "USD",
            total: "10.00", // Amount should match the amount used in create-payment
          },
        },
      ],
    };

    paypal.payment.execute(
      paymentId,
      execute_payment_json,
      async (error, payment) => {
        if (error) {
          console.error(error);
          res.status(500).send(error);
        } else {
          // Save payment details to MongoDB using Mongoose
          try {
            const {
              amount,
              currency,
              state: status,
              description,
            } = payment.transactions[0];
            const customerEmail = payment.payer.payer_info.email;

            await Payment.create({
              payment_id: paymentId,
              payer_id: payerId,
              amount: parseFloat(amount.total),
              currency: currency,
              status: status,
              description: description,
              customer_email: customerEmail,
            });

            res.send("Payment successful and saved");
          } catch (dbError) {
            console.error("Database insertion error:", dbError);
            res
              .status(500)
              .send("Payment processed but failed to save in database");
          }
        }
      }
    );
  },

  cancel: async (req, res) => {
    res.send("Payment cancelled");
  },
};
