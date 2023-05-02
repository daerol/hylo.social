const User = require("../Models/UserModel");

const allUsers = async () => {
    try {
        const users = await User.find();
        return users;
    } catch (err) {
        console.log(err);
        return [];
    }
};

module.exports = { allUsers };
