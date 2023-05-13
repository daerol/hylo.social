// ===========================express and router===========================
const express = require("express");
const router = express.Router();

// ===========================import controllers===========================
const userController = require("../Controllers/UserControllers");

// ===========================import middlware===========================
const { protection } = require("../Middleware/ProtectionMiddleware");

// ===========================other imports===========================
const multer = require("multer");
const storage = multer.memoryStorage();

const upload = multer({
    storage,
});

// ===========================all routes===========================
// =========================Create=========================


/**
 * @swagger
 * /user/login: 
 *   post:
 *     summary: Login user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The user's email.
 *                 example: example@email.com
 *               password:
 *                 type: string
 *                 description: The user's password.
 *                 example: password
 *     responses:
 *       201:
 *         ...
 */ 

router.post("/login", userController.loginUser);
router.post("/", upload.single("file"), userController.createUser);
// =========================Read=========================
router.get("/", userController.findAllUsers);
router.get("/db/:userId", userController.findUserByDbId);
router.get("/id/:genId", userController.findUserByGenId);
router.get("/:username", userController.findUserByUserName);
// =========================Update=========================
router.put("/:userId", protection, userController.changeUsername);
router.put("/p/:userId",upload.single("file"),protection,userController.changeProfilePic)
router.put("/p/d/:userId",protection,userController.removeProfilePic)
router.put("/r/:userId", protection, userController.refreshShortenedURL);

// =========================Delete=========================
router.delete("/:userId", protection, userController.deleteUser);
// ===========================export routes===========================
module.exports = router;
