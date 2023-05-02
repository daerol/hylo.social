const supertest = require("supertest");
const app = require("../app");
const User = require("../Models/UserModel");
const { ObjectId } = require("../helperFunctions/idGenerator");

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
                email: "test@gmail.com",
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
        await supertest(app).post("/users").send({
            email: "test1@gmail.com",
            username: "testss",
            password: "123456",
        });

        const usernameTaken = await supertest(app).post("/users").send({
            email: "test2@gmail.com",
            username: "testss",
            password: "123456",
        });
        expect(usernameTaken.statusCode).toBe(400);
        expect(usernameTaken.body["message"]).toBe("Username is taken");
    });

    test("Email is taken", async () => {
        await supertest(app).post("/users").send({
            email: "test3@gmail.com",
            username: "tests2",
            password: "123456",
        });

        const usernameTaken = await supertest(app).post("/users").send({
            email: "test3@gmail.com",
            username: "tests32",
            password: "123456",
        });
        expect(usernameTaken.statusCode).toBe(400);
        expect(usernameTaken.body["message"]).toBe("Email is taken");
    });

    test("Invalid email", async () => {
        const invalidEmail = await supertest(app).post("/users").send({
            email: "tescom",
            username: "tests2",
            password: "11122",
        });
        expect(invalidEmail.statusCode).toBe(400);
        expect(invalidEmail.body["message"]).toBe("Invalid email");
    });

    test("Invalid password", async () => {
        const invalidPassword = await supertest(app).post("/users").send({
            email: "test3@gmail.com",
            username: "tests2",
            password: "11122",
        });
        expect(invalidPassword.statusCode).toBe(400);
        expect(invalidPassword.body["message"]).toBe(
            "Password has to be at least 6 characters"
        );
    });
});

/* Connecting to the database before each test. */
beforeEach(async () => {
    await initialiseConnection().then(async () => {
        await resetTestDB();
    });
});

/* Closing database connection after each test. */
afterEach(async () => {
    await resetTestDB().then(async () => {
        await cutConnection();
    });
});
