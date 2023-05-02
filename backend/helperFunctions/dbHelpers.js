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
        console.log("Seeded");
    });
};

module.exports = { allUsers, seedUsers };
