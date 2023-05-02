// for testing

const mongoose = require("mongoose");
const User = require("../Models/UserModel");
const Link = require("../Models/LinkModel");

const resetTestDB = async () => {
    await User.deleteMany({});
    await Link.deleteMany({});
};

const initialiseConnection = async () => {
    await mongoose.connect(process.env.TEST_MONGODB_URI);
};

const cutConnection = async () => {
    await mongoose.connection.close();
};

module.exports = { resetTestDB, initialiseConnection, cutConnection };
