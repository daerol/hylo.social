const User = require("../Models/UserModel");
const Link = require("../Models/LinkModel");
const bcrypt = require("bcryptjs");
// ==============================CRUD==============================
// ==========================POST==========================

// ==========================GET==========================
// ================Get all================
const allUsers = async () => {
    try {
        const users = await User.find();
        return users;
    } catch (err) {
        console.log(err);
        return [];
    }
};

const allLinks = async () => {
    try {
        const links = await Link.find();
        return links;
    } catch (err) {
        console.log(err);
        return [];
    }
};
// ================Get by================
const getUserByDatabaseID = async (databaseID) => {
    try {
        const returnUser = await User.findById(databaseID);
        return returnUser;
    } catch (err) {
        // console.log(err);
        return null;
    }
};

const getLinkByDatabaseID = async (databaseID) => {};

// ==============================Seeding==============================
const { generateShortenedID } = require("./urlManager");
const seedUsers = async () => {
    const salt = await bcrypt.genSalt(10);
    var promises = [];
    for (var i = 0; i < 10; i++) {
        const hashedPassword = bcrypt.hashSync("123456", salt);
        var newUser = new User({
            email: "test" + i + "@gmail.com",
            username: "user" + i,
            shortenedURL: generateShortenedID(),
            password: hashedPassword,
        });
        var createUserPromise = await User.create(newUser);
        promises.push(createUserPromise);
    }
    Promise.allSettled(promises).then(() => {
        console.log("Users seeded");
    });
};

const seedLinks = async () => {
    var getSeededUsers = await allUsers();
    var promises = [];
    for (var i = 0; i < getSeededUsers.length; i++) {
        const userId = getSeededUsers[i]["_id"];
        const noOfLinks = Math.floor(Math.random() * 5) + 1;
        for (var j = 0; j < noOfLinks; j++) {
            var newLink = new Link({
                userId,
                linkName: "Link Name" + i + j,
                linkURL: "LinkURL" + i + j,
            });
            var createLinkPromise = await Link.create(newLink);
            promises.push(createLinkPromise);
        }
    }
    Promise.allSettled(promises).then(() => {
        console.log("Links seeded");
    });
};

module.exports = {
    allUsers,
    allLinks,
    getUserByDatabaseID,
    seedUsers,
    seedLinks,
};
