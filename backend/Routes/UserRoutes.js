// ===========================express and router===========================
const express = require("express");
const router = express.Router();

// ===========================import controllers===========================
const userController = require("../Controllers/UserControllers");

// ===========================import middlware===========================
const { protection } = require("../Middleware/ProtectionMiddleware");

// ===========================all routes===========================
// =========================Create=========================
router.post("/login", userController.loginUser);
router.post("/", userController.createUser);
// =========================Read=========================
router.get("/", userController.findAllUsers);
router.get("/db/:userId", userController.findUserByDbId);
router.get("/id/:genId", userController.findUserByGenId);
router.get("/:username", userController.findUserByUserName);
// =========================Update=========================
router.put("/:userId", protection,userController.changeUsername);
router.put("/r/:userId", protection,userController.refreshShortenedURL);
// =========================Delete=========================
router.delete("/:userId", protection,userController.deleteUser);
// ===========================export routes===========================
module.exports = router;
