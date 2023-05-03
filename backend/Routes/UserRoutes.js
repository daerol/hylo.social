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
router.get("/db/:userId", userController.findUserByDbId);
router.get("/id/:genId", userController.findUserByGenId);
router.get("/:username", userController.findUserByUserName);
// =========================Update=========================
router.put("/:userId", userController.changeUsername);
router.put("/r/:userId", userController.refreshShortenedURL);
// =========================Delete=========================

// ===========================export routes===========================
module.exports = router;
