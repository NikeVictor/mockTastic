const mongoose = require("mongoose");
const connectDB = async (string) => {
   try {
        return mongoose.connect(string)
   } catch (error) {
    console.log(error)
   }
}
module.exports = connectDB;