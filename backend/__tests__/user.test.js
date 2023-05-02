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
        expect(filledUpCorrectlyResponse.statusCode).toBe(200);
    });

    test("Username is taken", async () => {
        await supertest(app).post("/users").send({
            email: "test1@gmail.com",
            username: "testss",
            password: "123456",
        });

        const usernameTaken = await supertest(app).post("/users").send({
            email: "test2@gmail.com",
            username: "hahaah",
            password: "123456",
        });
        expect(usernameTaken.statusCode).toBe(500);
    });

    test("Email is taken", async () => {
        await supertest(app).post("/users").send({
            email: "test3@gmail.com",
            username: "tests2",
            password: "123456",
        });
        expect(filledUpCorrectlyResponse.statusCode).toBe(200);

        const usernameTaken = await supertest(app).post("/users").send({
            email: "test3@gmail.com",
            username: "tests32",
            password: "123456",
        });
        expect(usernameTaken.statusCode).toBe(500);
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
