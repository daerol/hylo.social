// ===========================express and router===========================
const express = require("express");
const router = express.Router();

// ===========================import controllers===========================
const userController = require("../Controllers/UserControllers");

// ===========================all routes===========================
// =========================Create=========================
router.post("/", userController.createUser);
// =========================Read=========================
router.get("/", userController.findAllUsers);
router.get("/:userId", userController.findUserByDbId);
router.get("/id/:genId", userController.findUserByGenId);
// =========================Update=========================

// =========================Delete=========================

// ===========================export routes===========================
module.exports = router;
