const supertest = require("supertest");
const app = require("../app");
const User = require("../Models/UserModel");
const { seedUsers } = require("../helperFunctions/dbHelpers");
const { newObjectId } = require("../helperFunctions/idGenerator");

const {
    resetTestDB,
    initialiseConnection,
    cutConnection,
} = require("../helperFunctions/dbConnection");

describe("POST (of user)", () => {
    test("All the correct fields", async () => {
        const filledUpCorrectlyResponse = await supertest(app)
            .post("/users")
            .send({
                email: "testuser@gmail.com",
                username: "test123",
                password: "123456",
            });
        const { statusCode, body } = filledUpCorrectlyResponse;
        console.log("body", body);
        expect(statusCode).toBe(200);
        expect(body).toHaveProperty("shortenedURL");
        expect(body).toHaveProperty("message");
        expect(body).toHaveProperty("id");
        expect(body["message"]).toBe("User created");
    });

    test("Username is taken", async () => {
        const usernameTaken = await supertest(app).post("/users").send({
            email: "test2@testusername.com",
            username: "user1",
            password: "123456",
        });
        expect(usernameTaken.statusCode).toBe(400);
        expect(usernameTaken.body["message"]).toBe("Username is taken");
    });

    test("Email is taken", async () => {
        const emailTaken = await supertest(app).post("/users").send({
            email: "test3@gmail.com",
            username: "emailtaken",
            password: "123456",
        });
        expect(emailTaken.statusCode).toBe(400);
        expect(emailTaken.body["message"]).toBe("Email is taken");
    });

    test("Invalid email", async () => {
        const invalidEmail = await supertest(app).post("/users").send({
            email: "tescom",
            username: "invalidemail",
            password: "11122",
        });
        expect(invalidEmail.statusCode).toBe(400);
        expect(invalidEmail.body["message"]).toBe("Invalid email");
    });

    test("Invalid password", async () => {
        const invalidPassword = await supertest(app).post("/users").send({
            email: "testingemail@gmail.com",
            username: "invalidpass",
            password: "11122",
        });
        expect(invalidPassword.statusCode).toBe(400);
        expect(invalidPassword.body["message"]).toBe(
            "Password has to be at least 6 characters"
        );
    });
});

describe("GET by given database ID", () => {
    test("User with Database ID exists", async () => {
        const getAllUsers = await supertest(app).get("/users");
        const { body } = getAllUsers;
        const validId = body[0]["_id"];
        const userWithDbId = await supertest(app).get(`/users/db/${validId}`);
        // found
        expect(userWithDbId.statusCode).toBe(200);
    });

    test("User with Database ID does not exist", async () => {
        const nonexistentId = newObjectId();
        const userWithoutDbId = await supertest(app).get(
            `/users/${nonexistentId}`
        );

        // not found
        expect(userWithoutDbId.statusCode).toBe(404);
        expect(userWithoutDbId.body["message"]).toBe("User does not exist");
    });

    test("User with Database ID is invalid", async () => {
        const invalidId = "123456";
        const userWithoutDbId = await supertest(app).get(
            `/users/db/${invalidId}`
        );

        // does not exist
        expect(userWithoutDbId.statusCode).toBe(500);
    });
});

// the 'url'
describe("GET by given generated ID", () => {
    test("User with Generated ID exists", async () => {
        const getAllUsers = await supertest(app).get("/users");
        const { body } = getAllUsers;
        const validId = body[0]["shortenedURL"];
        const userWithGenId = await supertest(app).get(`/users/id/${validId}`);
        // found
        expect(userWithGenId.statusCode).toBe(200);
    });

    test("User with Generated ID does not exist", async () => {
        const nonexistentId = "nonexistentid";
        const userWithoutGenId = await supertest(app).get(
            `/users/id/${nonexistentId}`
        );

        // not found
        expect(userWithoutGenId.statusCode).toBe(404);
        expect(userWithoutGenId.body["message"]).toBe("User does not exist");
    });
});

// username
describe("GET by username", () => {
    test("User with username exists", async () => {
        const getAllUsers = await supertest(app).get("/users");
        const { body } = getAllUsers;
        const validUserName = body[0]["username"];
        const userWithUsername = await supertest(app).get(
            `/users/${validUserName}`
        );
        // found
        expect(userWithUsername.statusCode).toBe(200);
    });

    test("User with username does not exist", async () => {
        const nonexistentUsername = "nonexistentname";
        const userWithoutUserName = await supertest(app).get(
            `/users/${nonexistentUsername}`
        );

        // not found
        expect(userWithoutUserName.statusCode).toBe(404);
        expect(userWithoutUserName.body["message"]).toBe("User does not exist");
    });
});

// change username
describe("Changing of username", () => {
    test("User does not exist", async () => {
        const nonexistentId = newObjectId();
        const nonexistentUser = await supertest(app)
            .put(`/users/${nonexistentId}`)
            .send({
                username: "invalidpass",
            });

        // not found
        expect(nonexistentUser.statusCode).toBe(404);
        expect(nonexistentUser.body["message"]).toBe("User does not exist");
    });
    test("Change to an already taken username", async () => {
        const getAllUsers = await supertest(app).get("/users");
        const { body } = getAllUsers;
        const takenUserName = body[0]["username"];
        const targetUserId = body[1]["_id"];

        const usernameExists = await supertest(app)
            .put(`/users/${targetUserId}`)
            .send({
                username: takenUserName,
            });
        expect(usernameExists.statusCode).toBe(500);
        expect(usernameExists.body["message"]).toBe("Username already exists");
    });
    test("Change to a brand new username", async () => {
        const getAllUsers = await supertest(app).get("/users");
        const { body } = getAllUsers;
        const newUsername = "A changed user"
        const targetUserId = body[1]["_id"];

        const changeUsernameSuccessful = await supertest(app)
            .put(`/users/${targetUserId}`)
            .send({
                username: newUsername,
            });
        expect(changeUsernameSuccessful.statusCode).toBe(200);
        expect(changeUsernameSuccessful.body["message"]).toBe("Username successfully changed");
    });
});

/* Connecting to the database before each test. */
beforeAll(async () => {
    await initialiseConnection().then(async () => {
        await resetTestDB();
        await seedUsers();
    });
});

/* Closing database connection after each test. */
afterAll(async () => {
    await resetTestDB().then(async () => {
        await cutConnection();
    });
});
