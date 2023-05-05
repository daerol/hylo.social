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
describe("[GET] Get link by user", () => {
    test("User exists", async () => {
        const getAllUsers = await supertest(app).get("/users");
        const { body: users } = getAllUsers;
        const validUserId = users[0]["_id"];
        const getUserLinks = await supertest(app).get(
            `/links/u/${validUserId}`
        );

        const { statusCode, body } = getUserLinks;
        expect(statusCode).toBe(200);
        expect(body).toHaveProperty("links");
        // console.log(body.links)
    });
    test("User does not exist", async () => {
        const nonexistentId = newObjectId();
        const userWithoutDbId = await supertest(app).get(
            `/links/u/${nonexistentId}`
        );

        // not found
        expect(userWithoutDbId.statusCode).toBe(404);
        expect(userWithoutDbId.body["message"]).toBe("User does not exist");
    });
    test("Invalid user", async () => {
        const invalidId = "testing1234";
        const invalidUserDbID = await supertest(app).get(
            `/links/u/${invalidId}`
        );

        // not found
        expect(invalidUserDbID.statusCode).toBe(404);
        expect(invalidUserDbID.body["message"]).toBe("User does not exist");
    });
});
// ==================PUT==================
describe("[PUT] Update links (authorised)", () => {
    var validToken = null;
    var testId; //
    var selectedLink;
    let nonexistentId = newObjectId();
    beforeEach(async () => {
        const credentials = {
            email: "test4@gmail.com",
            password: "123456",
        };
        const loginUser = await supertest(app)
            .post("/users/login")
            .send(credentials);
        const { body: loginUserBody } = loginUser;

        const { token, userId } = loginUserBody;
        validToken = token; // Or something
        testId = userId;

        const getLinks = await supertest(app).get(`/links/u/${testId}`);
        const { body } = getLinks;
        const { links } = body;
        selectedLink = links[0];
    });

    test("All the fields are correct", async () => {
        const updateAllFieldsCorrectly = await supertest(app)
            .put(`/links/${selectedLink._id}`)
            .set("Authorization", "Bearer " + validToken)
            .send({
                linkName: "New link name i think?",
                linkURL: "Testing123 link",
            });
        const {
            body: updateAllFieldsCorrectlyBody,
            statusCode: updateAllFieldsCorrectlyStatusCode,
        } = updateAllFieldsCorrectly;

        expect(updateAllFieldsCorrectlyStatusCode).toBe(200);
        expect(updateAllFieldsCorrectlyBody["message"]).toBe("Link updated");
    });
    test("Link does not exist", async () => {
        const updateLinkDontExist = await supertest(app)
            .put(`/links/${nonexistentId}`)
            .set("Authorization", "Bearer " + validToken)
            .send({
                linkName: "New link name i think?",
                linkURL: "Testing123 link",
            });
        const {
            body: updateLinkDontExistBody,
            statusCode: updateLinkDontExistStatusCode,
        } = updateLinkDontExist;

        expect(updateLinkDontExistStatusCode).toBe(404);
        expect(updateLinkDontExistBody["message"]).toBe("Link not found");
    });
    test("Link name is empty", async () => {
        const updateEmptyLinkName = await supertest(app)
            .put(`/links/${selectedLink._id}`)
            .set("Authorization", "Bearer " + validToken)
            .send({
                linkName: "",
                linkURL: "Testing123 link",
            });
        const {
            body: updateEmptyLinkNameBody,
            statusCode: updateEmptyLinkNameStatusCode,
        } = updateEmptyLinkName;

        expect(updateEmptyLinkNameStatusCode).toBe(401);
        expect(updateEmptyLinkNameBody["message"]).toBe(
            "Link name cannot be empty"
        );
    });
    test("Link URL is empty", async () => {
        const updateEmptyLinkURL = await supertest(app)
            .put(`/links/${selectedLink._id}`)
            .set("Authorization", "Bearer " + validToken)
            .send({
                linkName: "New link name i think?",
                linkURL: "",
            });
        const {
            body: updateEmptyLinkURLBody,
            statusCode: updateEmptyLinkURLStatusCode,
        } = updateEmptyLinkURL;

        expect(updateEmptyLinkURLStatusCode).toBe(401);
        expect(updateEmptyLinkURLBody["message"]).toBe(
            "Link URL cannot be empty"
        );
    });
});
// ==================DELETE==================
describe("[DELETE] Deleting link by Database ID", () => {
    test("Link does not exist", async () => {});
    test("Link exists, delete successful", async () => {});
});

// ==================JWT middleware==================
describe("[PUT/DELETE] Testing of protection middleware", () => {
    var validToken = null;
    var invalidToken = "testing";
    var randomID = newObjectId();
    var validId; //this is the target of deleting/changing
    var testId; //
    var selectedLink;
    beforeEach(async () => {
        const credentials = {
            email: "test4@gmail.com",
            password: "123456",
        };
        const loginUser = await supertest(app)
            .post("/users/login")
            .send(credentials);
        const { body: loginUserBody } = loginUser;

        const { token, userId } = loginUserBody;
        validToken = token; // Or something
        testId = userId;

        const getUsers = await supertest(app).get("/users");
        const { body: getUsersBody } = getUsers;
        validId = getUsersBody[0]["_id"];

        const getLinks = await supertest(app).get(`/links/u/${validId}`);
        const { body } = getLinks;
        const { links } = body;
        selectedLink = links[0];
        console.log("selectedLink", selectedLink);
    });

    test("No JWT inside", async () => {
        // ===========edit link===========
        const noJWTEditLink = await supertest(app)
            .put(`/links/${selectedLink._id}`)
            .send({
                linkName: "New link name?",
                linkURL: "Testing123 link",
            });
        const { statusCode: noJWTEditLinkStatusCode, body: noJWTEditLinkBody } =
            noJWTEditLink;
        expect(noJWTEditLinkStatusCode).toBe(403);
        expect(noJWTEditLinkBody.message).toBe("Unauthorised");

        // ===========delete link===========
        const noJWTDeleteLink = await supertest(app).delete(
            `/links/${selectedLink._id}`
        );
        const {
            statusCode: noJWTDeleteLinkStatusCode,
            body: noJWTDeleteLinkBody,
        } = noJWTDeleteLink;
        expect(noJWTDeleteLinkStatusCode).toBe(403);
        expect(noJWTDeleteLinkBody.message).toBe("Unauthorised");
    });

    test("Invalid JWT inside", async () => {
        // ===========edit link===========
        const invalidJWTEditLink = await supertest(app)
            .delete(`/links/${selectedLink._id}`)
            .set("Authorization", "Bearer " + invalidToken);
        const {
            statusCode: invalidJWTEditLinkStatusCode,
            body: invalidJWTEditLinkBody,
        } = invalidJWTEditLink;
        expect(invalidJWTEditLinkStatusCode).toBe(403);
        expect(invalidJWTEditLinkBody.message).toBe("Unauthorised");

        // ===========delete link===========
        const invalidJWTDeleteLink = await supertest(app)
            .delete(`/links/${selectedLink._id}`)
            .set("Authorization", "Bearer " + invalidToken);
        const {
            statusCode: invalidJWTDeleteLinkStatusCode,
            body: invalidJWTDeleteLinkBody,
        } = invalidJWTDeleteLink;
        expect(invalidJWTDeleteLinkStatusCode).toBe(403);
        expect(invalidJWTDeleteLinkBody.message).toBe("Unauthorised");
    });

    test("JWT user and queried user mismatch", async () => {
        // ===========edit link===========
        const mismatchEditLink = await supertest(app)
            .put(`/links/${selectedLink._id}`)
            .set("Authorization", "Bearer " + validToken)
            .send({
                linkName: "New link name?",
                linkURL: "Testing123 link",
            });
        const {
            statusCode: mismatchEditLinkStatusCode,
            body: mismatchEditLinkBody,
        } = mismatchEditLink;
        expect(mismatchEditLinkStatusCode).toBe(403);
        expect(mismatchEditLinkBody.message).toBe("Unauthorised");

        // ===========delete link===========
        const mismatchDeleteLink = await supertest(app)
            .delete(`/links/${selectedLink._id}`)
            .set("Authorization", "Bearer " + validToken);
        const {
            statusCode: mismatchDeleteLinkStatusCode,
            body: mismatchDeleteLinkBody,
        } = mismatchDeleteLink;
        expect(mismatchDeleteLinkStatusCode).toBe(403);
        expect(mismatchDeleteLinkBody.message).toBe("Unauthorised");
    });
});

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
