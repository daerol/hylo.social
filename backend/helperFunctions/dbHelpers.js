const User = require("../Models/UserModel");
const Link = require("../Models/LinkModel");

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

const { generateShortenedID } = require("./urlManager");
const seedUsers = async () => {
    var promises = [];
    for (var i = 0; i < 30; i++) {
        var newUser = new User({
            email: "test" + i + "@gmail.com",
            username: "user" + i,
            shortenedURL: generateShortenedID(),
            password: "123456",
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
            var createLinkPromise = await Link.create(newLink)
            promises.push(createLinkPromise)
        }
    }
    Promise.allSettled(promises).then(() => {
        console.log("Links seeded");
    });
};

module.exports = { allUsers, seedUsers,seedLinks };
