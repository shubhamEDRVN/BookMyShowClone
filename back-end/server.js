const express = require("express");
const app = express();
require('dotenv').config();
const connectDB = require('./dbConnection')
const Ticket = require('./schema');
const cors = require("cors");

app.use(cors());
//Middleware for parsing Json
app.use(express.json());
//Connecting to Database
connectDB();
app.use(express.urlencoded({ extended: false }))
// creating an api and seperating it.
app.use("/api", require("./routes"));

const port = process.env.PORT || 8080;

app.listen(port,()=>{
    console.log(`App listening to port ${port}`)
});