// ===========================express and router===========================
const express = require("express");
const router = express.Router();

// ===========================import controllers===========================
const linkController = require("../Controllers/LinkControllers");

// ===========================all routes===========================
// =========================Create=========================
router.post("/", linkController.createLink);
// =========================Read=========================
router.get("/u/:userId", linkController.getUserLinksByUserId);
// =========================Update=========================
// =========================Delete=========================
// ===========================export routes===========================
module.exports = router;
