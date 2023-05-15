// ===========================express and router===========================
const express = require("express");
const router = express.Router();

// ===========================import controllers===========================
const linkController = require("../Controllers/LinkControllers");

// ===========================import middlware===========================
const { protection } = require("../Middleware/ProtectionMiddleware");

// ===========================all routes===========================
// =========================Create=========================

/**
 * @swagger
 * /links/: 
 *   post:
 *     summary: Creates new link.
 *     tags:
 *       - links
 *     description: Create new link by taking in userId (user database ID), linkName (name of link) and linkURL (the URL of the link)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The database ID of the user
 *               linkName:
 *                 type: string
 *                 description: The name of the link
 *                 example: Link name
 *               linkURL:
 *                 type: string
 *                 description: The URL of the link.
 *                 example: https://www.youtube.com
 *     responses:
 *       200:
 *         description: Link successfully created
 *       404:
 *         description: User not found
 *       400:
 *         description: Link name or URL empty
 *       500:
 *         description: Something went wrong
 */ 
router.post("/", linkController.createLink);
// =========================Read=========================
/**
 * @swagger
 * /links/: 
 *  get:
 *      summary: This endpoint is to allow us to check all the links :)
 *      tags:
 *        - links
 *        - test
 *      description: Get all links in database
 *      responses:
 *          200:
 *              description: Links returned
 *          500:
 *              description: Something went wrong
 */
router.get("/",linkController.findAllLinks)

/**
 * @swagger
 * /links/u/{userId}: 
 *  get:
 *      summary: This endpoint allows us to retrive user by their database generated ID
 *      tags:
 *        - links
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
 *              description: Link(s) found if any
 *          404:
 *              description: User not found
 *          500:
 *              description: Something went wrong
 */
router.get("/u/:userId", linkController.getUserLinksByUserId);
// =========================Update=========================

/**
 * @swagger
 * /links/{linkId}:
 *  put:
 *      summary: This allows users to change their link names and/or URL
 *      tags:
 *      - links
 *      - protected
 *      description: Replaces profile pic of a user.
 *      parameters:
 *          - in: path
 *            name: linkId
 *            required: true
 *            description:  Link ID (Database generated)
 *            schema:
 *              type: string
 * 
 *      requestBody:
 *          required: true
 *          content:
 *            application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                   description: The database ID of the user
 *                 linkName:
 *                   type: string
 *                   description: The name of the link
 *                   example: Link name
 *                 linkURL:
 *                   type: string
 *                   description: The URL of the link.
 *                   example: https://www.youtube.com
 *
 *      responses:
 *          200:
 *              description: Link successfully updated
 *          404:
 *              description: Link not found
 *          403:
 *              description: Unauthorised access
 *          400:
 *              description: Link name and URL cannot be empty
 *          500:
 *              description: Something went wrong
 */
router.put("/:linkId", protection, linkController.updateLinkById);
// =========================Delete=========================

/**
 * @swagger
 * /links/{linkId}:
 *  delete:
 *      summary: This allows users to delete their links
 *      tags:
 *      - links
 *      - protected
 *      description: Deletes user account with given ID and matching token
 *      parameters:
 *          - in: path
 *            name: linkId
 *            required: true
 *            description: Link unique database ID (cannot be regenerated)
 *            schema:
 *              type: string
 *
 *      responses:
 *          200:
 *              description: Link deleted
 *          404: 
 *              description: Link not found
 *          403:
 *              description: Unauthorised access
 *          500:
 *              description: Something went wrong
 */
router.delete("/:linkId", protection, linkController.deleteLinkById);
// ===========================export routes===========================
module.exports = router;
