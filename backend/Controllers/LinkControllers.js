const Link = require("../Models/LinkModel");
const User = require("../Models/UserModel");

// =========================Helper functions=========================
const {
    allLinks,
    getUserByDatabaseID,
} = require("../helperFunctions/dbHelpers");

const userMatch = (currentUserId, targetUserId) => {
    return currentUserId == targetUserId;
};
// =========================Create=========================
const createLink = async (req, res) => {
    // input:
    // body:
    // userId: (database ID of a given user)
    // linkName: name of link
    // linkURL: URL of link
    // output:
    // id (database generated ID)
    const { userId, linkName, linkURL } = req.body;
    try {
        // check if user exists
        // check if linkName is valid
        // check if linkURL is valid
        const targetUser = await getUserByDatabaseID(userId);
        if (targetUser == null) {
            return res.status(404).json({ message: "User does not exist" });
        }
        if (linkName.length == 0) {
            return res
                .status(400)
                .json({ message: "Link name cannot be empty" });
        }
        if (linkURL.length == 0) {
            return res
                .status(400)
                .json({ message: "Link URL cannot be empty" });
        }
        const newLink = new Link({
            userId,
            linkName,
            linkURL,
        });

        await Link.create(newLink).then((createdLink) => {
            return res.status(200).json({
                message: "Link created",
                id: createdLink._id,
            });
        });
    } catch (err) {
        return res.status(500).json({
            message: err,
        });
    }
};
// =========================Read=========================
const findAllLinks = async (req, res) => {
    // test function
    try {
        const links = await allLinks();
        return res.status(200).json(links);
    } catch (err) {
        return res.status(500).json({
            message: err,
        });
    }
};

const getUserLinksByUserId = async (req, res) => {
    // input:
    // params:
    // userId: (database ID of a given user)
    // output:
    // links (array that return all the user's links)
    const { userId } = req.params;
    try {
        const targetUser = await getUserByDatabaseID(userId);
        if (targetUser == null) {
            return res.status(404).json({ message: "User does not exist" });
        }
        const links = await Link.find({ userId });
        return res.status(200).json({
            links,
        });
    } catch (err) {
        return res.status(500).json({
            message: err,
        });
    }
};
// =========================Update=========================
const updateLinkById = async (req, res) => {
    // input:
    // params:
    // linkId: (database ID of link)
    // body:
    // linkName: (new name of the link)
    // linkURL: (new URL of the link)
    const { params, body, currUser } = req;
    const { linkName, linkURL } = body;
    const { linkId } = params;
    try {
        const targetLink = await Link.findById(linkId);
        if (!userMatch(currUser._id, targetLink.userId)) {
            return res.status(403).json({ message: "Unauthorised" });
        }
        if (targetLink == null) {
            return res.status(404).json({ message: "Link not found" });
        }
    } catch (err) {
        return res.status(500).json({
            message: err,
        });
    }
};
// =========================Delete=========================
const deleteLinkById = async (req, res) => {
    // input:
    // params:
    // linkId: (database ID of link)
    const { params, body, currUser } = req;
    const { linkId } = params;
    try {
        const targetLink = await Link.findById(linkId);
        if (!userMatch(currUser._id, targetLink.userId)) {
            return res.status(403).json({ message: "Unauthorised" });
        }
        if (targetLink == null) {
            return res.status(404).json({ message: "Link not found" });
        }
    } catch (err) {
        return res.status(500).json({
            message: err,
        });
    }
};
module.exports = {
    createLink,
    getUserLinksByUserId,
    updateLinkById,
    deleteLinkById,
};
