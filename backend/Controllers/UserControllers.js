const User = require("../Models/UserModel");
const bcrypt = require("bcryptjs");

// =========================Helper functions=========================
const { allUsers } = require("../helperFunctions/dbHelpers");
const { generateShortenedID } = require("../helperFunctions/urlManager");

// =========================Create=========================
const createUser = async (req, res) => {
    // input:
        // body:
            // email (string)
            // userId (string)
            // password (string)
    // output:
        // id (database generated ID)
        // 'shortenedUrl' (6 digit string for)

    try {
        const { email, username, password } = req.body;
        // check for valid email
        const EMAIL_REGEX =
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        if (EMAIL_REGEX.test(email) === false || email.length == 0) {
            return res.status(400).json({
                message: "Invalid email",
            });
        }

        const allRecords = await allUsers();
        // email cannot be taken
        const duplicateEmails = allRecords.filter((record) => {
            return record.email == email;
        });
        if (duplicateEmails.length > 0) {
            return res.status(400).json({
                message: "Email is taken",
            });
        }

        // username has to be unique
        const duplicateUsername = allRecords.filter((record) => {
            return record.username == username;
        });
        if (duplicateUsername.length > 0) {
            return res.status(400).json({
                message: "Username is taken",
            });
        }

        // password min 6 char
        if (password.length < 6) {
            return res.status(400).json({
                message: "Password has to be at least 6 characters",
            });
        }
        // // auto generate a url link

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const shortenedURL = generateShortenedID();
        const newUser = new User({
            email,
            username,
            password:hashedPassword,
            shortenedURL,
        });

        await User.create(newUser).then((createdUser) => {
            console.log(createdUser);
            console.log("typeof createdUser._id", typeof createdUser._id);
            return res.status(200).json({
                message: "User created",
                id: createdUser._id,
                shortenedURL: createdUser.shortenedURL,
            });
        });
    } catch (err) {
        console.log("err", err);
        return res.status(500).json({
            message: err,
        });
    }
};
// =========================Read=========================
const findAllUsers = async (req, res) => {
    // test function
    try {
        const users = await allUsers();
        return res.status(200).json(users);
    } catch (err) {
        return res.status(500).json({
            message: err,
        });
    }
};

const findUserByDbId = async (req, res) => {
    // input:
        // params:
            // userId (database ID)
    // output:
        // user object (for now)
        
    const { userId } = req.params;
    try {
        const validUser = await User.findById(userId);
        console.log("validUser",validUser)
        if (validUser == null) {
            return res.status(404).json({ message: "User does not exist" });
        }
        return res.status(200).json(validUser);
    } catch (err) {
        return res.status(500).json({
            message: err,
        });
    }
};

const findUserByGenId = async (req, res) => {
    // input:
        // params:
            // genId (generated ID)
    // output:
        // user object (for now)

    const { genId } = req.params;
    try {
        const validUser = await User.findOne({ shortenedURL: genId });
        if (validUser == null) {
            return res.status(404).json({ message: "User does not exist" });
        }
        return res.status(200).json(validUser);
    } catch (err) {
        return res.status(500).json({
            message: err,
        });
    }
};

const findUserByUserName = async (req, res) => {
    // input:
        // params:
            // username (username of user)
    // output:
        // user object (for now)

    const { username } = req.params;
    try {
        const validUser = await User.findOne({ username });
        if (validUser == null) {
            return res.status(404).json({ message: "User does not exist" });
        }
        return res.status(200).json(validUser);
    } catch (err) {
        return res.status(500).json({
            message: err,
        });
    }
};

// =========================Update=========================
const changeUsername = async (req, res) => {
    // input:
        // params:
            // userId (database generated id of user)
        // body:
            // username (new username)
    // output:
        // user object (for now)

    const { userId } = req.params;
    const { username } = req.body;
    try {
        const targetUser = await User.findById(userId);
        if (targetUser == null) {
            return res.status(404).json({ message: "User does not exist" });
        }
        const userWithSameName = await User.findOne({ username });
        if (userWithSameName != null && userWithSameName._id != userId) {
            return res.status(500).json({ message: "Username already exists" });
        }

        targetUser
            .updateOne(
                {
                    _id: userId,
                },
                {
                    username,
                }
            )
            .then((result) => {
                return res.status(200).json({
                    message: "Username successfully changed",
                });
            });
    } catch (err) {
        return res.status(500).json({
            message: err,
        });
    }
};

const refreshShortenedURL = async (req, res) => {
    // input:
        // params:
            // userId (database generated id of user)
    // output:
        // shortenedURL (the shortened url; but 6 digit string for now)
    const { userId } = req.params;
    try {
        const targetUser = await User.findById(userId);
        if (targetUser == null) {
            return res.status(404).json({ message: "User does not exist" });
        }
        const shortenedURL = generateShortenedID();
        User.updateOne(
            { _id: userId },
            {
                shortenedURL,
            }
        ).then((result) => {
            return res.status(200).json({
                message: "URL successfully refreshed",
                shortenedURL,
            });
        });
    } catch (err) {
        return res.status(500).json({
            message: err,
        });
    }
};

// =========================Delete=========================

module.exports = {
    createUser,
    findAllUsers,
    findUserByDbId,
    findUserByGenId,
    findUserByUserName,
    changeUsername,
    refreshShortenedURL
};
