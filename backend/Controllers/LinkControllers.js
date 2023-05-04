const Link = require("../Models/LinkModel");
const User = require("../Models/UserModel");

// =========================Helper functions=========================
const { allLinks } = require("../helperFunctions/dbHelpers");
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
        const targetUser = await User.findById(userId);
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

        await Link.create(newLink).then((createdLink)=>{
            return res.status(200).json({
                message: "Link created",
                id: createdLink._id,
            });
        })
    } catch (err) {
        return res.status(500).json({
            message: err,
        });
    }
};
// =========================Read=========================
// =========================Update=========================
// =========================Delete=========================
module.exports = {createLink};
