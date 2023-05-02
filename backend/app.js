// ===================imports===================
// ======express js setup======
const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");

// ===================Configs===================
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ===================Endpoints===================
// ============default============
app.get("/", (req, res) => {
    res.send("OK");
});

// ============for user============
app.use("/users",require("./Routes/UserRoutes"))

// ============for links============

module.exports = app;
