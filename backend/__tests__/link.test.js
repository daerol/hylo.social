// =================================imports=================================
const supertest = require("supertest");
const app = require("../app");
const { seedUsers, seedLinks } = require("../helperFunctions/dbHelpers");
const { newObjectId } = require("../helperFunctions/idGenerator");
const {
    resetTestDB,
    initialiseConnection,
    cutConnection,
} = require("../helperFunctions/dbConnection");
// =================================test cases=================================

// ==================POST==================
describe("[POST] Add link", () => {
    test("All the fields are correct", async () => {
        const getAllUsers = await supertest(app).get("/users");
        const { body: users } = getAllUsers;
        const userId = users[0]["_id"];
        const allFieldsCorrect = await supertest(app).post("/links").send({
            userId,
            linkName: "Insert Link name",
            linkURL: "This is a valid URL",
        });
        const { statusCode, body } = allFieldsCorrect;
        expect(statusCode).toBe(200);
        expect(body).toHaveProperty("message");
        expect(body).toHaveProperty("id");
        expect(body["message"]).toBe("Link created");
    });
    test("User does not exist", async () => {
        const userId = newObjectId();
        const nonexistentUser = await supertest(app).post("/links").send({
            userId,
            linkName: "Insert Link name",
            linkURL: "This is a valid URL",
        });
        expect(nonexistentUser.statusCode).toBe(404);
        expect(nonexistentUser.body["message"]).toBe("User does not exist");
    });
    test("Link name is empty", async () => {
        const getAllUsers = await supertest(app).get("/users");
        const { body: users } = getAllUsers;
        const userId = users[0]["_id"];
        const emptyLinkName = await supertest(app).post("/links").send({
            userId,
            linkName: "",
            linkURL: "This is a valid URL",
        });
        expect(emptyLinkName.statusCode).toBe(400);
        expect(emptyLinkName.body["message"]).toBe("Link name cannot be empty");
    });
    test("Link URL is empty", async () => {
        const getAllUsers = await supertest(app).get("/users");
        const { body: users } = getAllUsers;
        const userId = users[0]["_id"];
        const emptyLinkName = await supertest(app).post("/links").send({
            userId,
            linkName: "Link name here",
            linkURL: "",
        });
        expect(emptyLinkName.statusCode).toBe(400);
        expect(emptyLinkName.body["message"]).toBe("Link URL cannot be empty");
    });
});

// ==================GET==================

// ==================PUT==================

// ==================DELETE==================

// =================================Teardown & Setup=================================
/* Set up */
beforeAll(async () => {
    await initialiseConnection().then(async () => {
        await resetTestDB();
        await seedUsers();
        await seedLinks();
    });
});

/* Tear down */
afterAll(async () => {
    await resetTestDB().then(async () => {
        await cutConnection();
    });
});
