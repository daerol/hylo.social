// ===========================express and router===========================
const express = require("express");
const router = express.Router();

// ===========================import controllers===========================
const userController = require("../Controllers/UserControllers");

// ===========================all routes===========================
// =========================Create=========================
router.post("/",userController.createUser)
// =========================Read=========================

// =========================Update=========================

// =========================Delete=========================

// ===========================export routes===========================
module.exports = router;
