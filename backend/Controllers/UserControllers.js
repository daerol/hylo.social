const User = require("../Models/UserModel");

// =========================Helper functions=========================
const { allUsers } = require("../helperFunctions/dbHelpers");
const { generateShortenedID } = require("../helperFunctions/urlManager");

// =========================Create=========================
const createUser = async (req, res) => {
    // input:
    // email (string)
    // userId (string)
    // password (string)

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
        // res.status(200).json({
        //     message: "OK",
        // });
        // // auto generate a url link

        const shortenedURL = generateShortenedID();
        console.log(shortenedURL);

        const newUser = new User({
            email,
            username,
            password,
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
    const { userId } = req.params;
    try {
        const validUser = await User.findById(userId);
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
// =========================Delete=========================

module.exports = { createUser, findAllUsers, findUserByDbId };
