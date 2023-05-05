// ===========================express and router===========================
const express = require("express");
const router = express.Router();

// ===========================import controllers===========================
const linkController = require("../Controllers/LinkControllers");

// ===========================import middlware===========================
const { protection } = require("../Middleware/ProtectionMiddleware");

// ===========================all routes===========================
// =========================Create=========================
router.post("/", linkController.createLink);
// =========================Read=========================
router.get("/u/:userId", linkController.getUserLinksByUserId);
// =========================Update=========================
router.put("/:linkId", protection, linkController.updateLinkById);
// =========================Delete=========================
router.delete("/:linkId", protection, linkController.deleteLinkById);
// ===========================export routes===========================
module.exports = router;
