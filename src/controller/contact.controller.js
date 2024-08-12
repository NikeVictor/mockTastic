const Contact = require('../models/contact.model');

module.exports = {
    contactUs: async (req, res) => {
      try {
        const user = new Contact ({
          name: req.body.name,
          email: req.body.email,
          exam: req.body.exam,
        });
        await user.save();
        
        res.json({
          data: user
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({error});
    }
  },
  
}

   