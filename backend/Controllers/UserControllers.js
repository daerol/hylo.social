const User = require("../Models/UserModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// =========================Helper functions=========================
const {
    allUsers,
    getUserByDatabaseID,
} = require("../helperFunctions/dbHelpers");
const { generateShortenedID } = require("../helperFunctions/urlManager");

const generateJWT = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
};

const userMatch = (currentUserId, targetUserId) => {
    return currentUserId == targetUserId;
};

// =========================Create=========================
const loginUser = async (req, res) => {
    // input:
    // body:
    // email (string)
    // password(string)
    // output:
    // token (generated jwt token after login)
    const { email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser == null) {
            return res.status(404).json({
                message: "User with given email not found",
            });
        } else {
            // console.log(password);
            // console.log(existingUser);
            const { _id, password: existingUserPass } = existingUser;
            if (await bcrypt.compare(password, existingUserPass)) {
                return res.status(200).json({
                    message: "Login successful",
                    userId: _id,
                    token: generateJWT(_id),
                });
            } else {
                res.status(400).json({
                    message: "Invalid password",
                });
            }
        }
    } catch (err) {
        return res.status(500).json({
            message: err,
        });
    }
};

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

        if (username.length == 0) {
            return res.status(400).json({
                message: "Invalid username",
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
            password: hashedPassword,
            shortenedURL,
        });

        await User.create(newUser).then((createdUser) => {
            // console.log(createdUser);
            // console.log("typeof createdUser._id", typeof createdUser._id);
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
        const validUser = await getUserByDatabaseID(userId);
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

    const { currUser, params, body } = req;
    const { userId } = params;
    const { username } = body;
    try {
        if (!userMatch(currUser._id, userId)) {
            return res.status(403).json({ message: "Unauthorised" });
        }
        const userWithSameName = await User.findOne({ username });
        if (userWithSameName != null && userWithSameName._id != userId) {
            return res.status(500).json({ message: "Username already exists" });
        }
        User.updateOne(
            {
                _id: userId,
            },
            {
                username,
            }
        ).then((result) => {
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

    const { currUser, params } = req;
    const { userId } = params;
    try {
        if (!userMatch(currUser._id, userId)) {
            return res.status(403).json({ message: "Unauthorised" });
        }
        const targetUser = await getUserByDatabaseID(userId);
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
const deleteUser = async (req, res) => {
    // input:
    // params:
    // userId (database generated id of user)
    const { params, currUser } = req;
    const { userId } = params;
    try {
        if (!userMatch(currUser._id, userId)) {
            return res.status(403).json({ message: "Unauthorised" });
        }

        const targetUser = await getUserByDatabaseID(userId);
        if (targetUser == null) {
            return res.status(404).json({ message: "User does not exist" });
        }
        User.deleteOne({ _id: userId }).then((result) => {
            return res.status(200).json({
                message: "User successfully deleted",
            });
        });
    } catch (err) {
        return res.status(500).json({
            message: err,
        });
    }
};

module.exports = {
    loginUser,
    createUser,
    findAllUsers,
    findUserByDbId,
    findUserByGenId,
    findUserByUserName,
    changeUsername,
    refreshShortenedURL,
    deleteUser,
};
