const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
require("dotenv").config();
const logger = require("morgan");

const routes = require("./routes/payment.route");

const app = express();
app.use(logger("dev"));
app.use(express.json());
app.use(cors());

app.use('/', routes)


const PORT = process.env.PORT || 3000;
const start = async () => {
    await connectDB(process.env.DB_URL)
    app.listen(PORT, console.log('server is listening to port ' + PORT))
}
start();
