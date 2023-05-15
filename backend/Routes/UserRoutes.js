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
 * /users/login: 
 *   post:
 *     summary: Login user.
 *     tags:
 *       - users
 *     description: Login user using email and password
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
 *       200:
 *         description: Login successful
 *       404:
 *         description: User not found
 *       400:
 *         description: Invalid Password
 *       500:
 *         description: Something went wrong
 */ 
router.post("/login", userController.loginUser);

/**
 * @swagger
 * /users/: 
 *   post:
 *     summary: Register user.
 *     tags:
 *       - users
 *     description: Creates new user
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: The user's usernmae.
 *                 example: testusername
 *               email:
 *                 type: string
 *                 description: The user's email.
 *                 example: example@email.com
 *               password:
 *                 type: string
 *                 description: The user's password.
 *                 example: password
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: User successfully created
 *       400:
 *         description: Invalid/taken email/username, password less than 6 characters
 *       500:
 *         description: Something went wrong
 */ 
router.post("/", upload.single("file"), userController.createUser);
// =========================Read=========================
/**
 * @swagger
 * /users/: 
 *  get:
 *      summary: This endpoint is to allow us to check all users :)
 *      tags:
 *        - users
 *        - test
 *      description: Get all users in database
 *      responses:
 *          200:
 *              description: Users returned
 *          500:
 *              description: Something went wrong
 */
router.get("/", userController.findAllUsers);

/**
 * @swagger
 * /users/db/{userId}: 
 *  get:
 *      summary: This endpoint allows us to retrive user by their database generated ID
 *      tags:
 *        - users
 *      description: Get user with given database-generated ID as the parameter
 *      parameters:
 *          - in: path
 *            name: userId
 *            required: true
 *            description: User ID (from database)
 *            schema:
 *              type: string
 *      responses:
 *          200:
 *              description: User found
 *          404:
 *              description: User not found
 *          500:
 *              description: Something went wrong
 */
router.get("/db/:userId", userController.findUserByDbId);

/**
 * @swagger
 * /users/id/{genId}: 
 *  get:
 *      summary: This endpoint allows us to retrive user by their unique generated ID (can be regenerated)
 *      tags:
 *        - users
 *      description: Get user with unique generated ID (can be regenerated) as the parameter
 *      parameters:
 *          - in: path
 *            name: genId
 *            required: true
 *            description: User unique generated ID (can be regenerated)
 *            schema:
 *              type: string
 *      responses:
 *          200:
 *              description: User found
 *          404:
 *              description: User not found
 *          500:
 *              description: Something went wrong
 */
router.get("/id/:genId", userController.findUserByGenId);

/**
 * @swagger
 * /users/{username}: 
 *  get:
 *      summary: This endpoint allows us to retrive user by their unique username
 *      tags:
 *        - users
 *      description:  Get user with unique username as the parameter
 *      parameters:
 *          - in: path
 *            name: username
 *            required: true
 *            description: User's unique username
 *            schema:
 *              type: string
 *      responses:
 *          200:
 *              description: User found
 *          404:
 *              description: User not found
 *          500:
 *              description: Something went wrong
 */
router.get("/:username", userController.findUserByUserName);
// =========================Update=========================

/**
 * @swagger
 * /users/{userId}:
 *  put:
 *      summary: This allows users to change their unique usernames
 *      tags:
 *      - users
 *      - protected
 *      description: Takes in new username in the body and userId in the query, which requires JWT authorisation in the request header
 *      parameters:
 *          - in: path
 *            name: userId
 *            required: true
 *            description: User database generated ID (cannot be regenerated)
 *            schema:
 *              type: string
 * 
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                           username:
 *                              type: string
 *                              description: The user's usernmae.
 *                              example: testusername
 *      responses:
 *          200:
 *              description: Username successfully updated
 *          403:
 *              description: Unauthorised access
 *          400:
 *              description: Invalid/taken email/username, password less than 6 characters
 *          500:
 *               description: Something went wrong
 */
router.put("/:userId", protection, userController.changeUsername);

/**
 * @swagger
 * /users/p/{userId}:
 *  put:
 *      summary: This allows users to change their profile picture
 *      tags:
 *      - users
 *      - protected
 *      description: Replaces profile pic of a user.
 *      parameters:
 *          - in: path
 *            name: userId
 *            required: true
 *            description: User unique generated ID (can be regenerated)
 *            schema:
 *                  type: string
 * 
 *      requestBody:
 *          required: true
 *          content:
 *              multipart/form-data:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          file:
 *                              type: string
 *                              format: binary
 *
 *      responses:
 *          200:
 *              description: Profile picture successfully updated
 *          403:
 *              description: Unauthorised access
 *          400:
 *              description: Bad request(no picture)
 *          500:
 *               description: Something went wrong
 */
router.put("/p/:userId",upload.single("file"),protection,userController.changeProfilePic)

/**
 * @swagger
 * /users/p/d/{userId}:
 *  put:
 *      summary: This allows users to remove their profile picture
 *      tags:
 *      - users
 *      - protected
 *      description: Removes profile pic of a user.
 *      parameters:
 *          - in: path
 *            name: userId
 *            required: true
 *            description: User database generated ID (cannot be regenerated)
 *            schema:
 *              type: string
 *
 *      responses:
 *          200:
 *              description: Profile picture successfully updated
 *          403:
 *              description: Unauthorised access
 *          400:
 *              description: Bad request
 *          500:
 *               description: Something went wrong
 */
router.put("/r/:userId",protection,userController.removeProfilePic)

/**
 * @swagger
 * /users/r/{userId}:
 *  put:
 *      summary: This allows users to regenerate their short code
 *      tags:
 *      - users
 *      - protected
 *      description: Refreshes shortened ID of user
 *      parameters:
 *          - in: path
 *            name: userId
 *            required: true
 *            description: User unique database ID (cannot be regenerated)
 *            schema:
 *              type: string
 *
 *      responses:
 *          200:
 *              description: Profile picture successfully removed
 *          403:
 *              description: Unauthorised access
 *          400:
 *              description: Bad request
 *          500:
 *               description: Something went wrong
 */
router.put("/r/:userId", protection, userController.refreshShortenedURL);

// =========================Delete=========================

/**
 * @swagger
 * /users/{userId}:
 *  delete:
 *      summary: This allows users to delete their accounts
 *      tags:
 *      - users
 *      - protected
 *      description: Deletes user account with given ID and matching token
 *      parameters:
 *          - in: path
 *            name: userId
 *            required: true
 *            description: User unique database ID (cannot be regenerated)
 *            schema:
 *              type: string
 *
 *      responses:
 *          200:
 *              description: User deleted
 *          403:
 *              description: Unauthorised access
 *          500:
 *              description: Something went wrong
 */
router.delete("/:userId", protection, userController.deleteUser);
// ===========================export routes===========================
module.exports = router;
