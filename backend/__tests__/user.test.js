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
describe("[POST] Add user", () => {
    test("All the correct fields", async () => {
        const filledUpCorrectlyResponse = await supertest(app)
            .post("/users")
            .send({
                email: "testuser@gmail.com",
                username: "test123",
                password: "123456",
            });
        const { statusCode, body } = filledUpCorrectlyResponse;
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

    test("Invalid username", async () => {
        const invalidEmail = await supertest(app).post("/users").send({
            email: "testUser12345@gmail.com",
            username: "",
            password: "111222",
        });
        expect(invalidEmail.statusCode).toBe(400);
        expect(invalidEmail.body["message"]).toBe("Invalid username");
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

describe("[POST] Login user", () => {
    test("Invalid email/Email not found", async () => {
        const loginDetails = {
            email: "test",
            password: "123",
        };
        const invalidEmailLogin = await supertest(app)
            .post("/users/login")
            .send(loginDetails);

        const { body, statusCode } = invalidEmailLogin;
        expect(statusCode).toBe(404);
        expect(body["message"]).toBe("User with given email not found");
    });
    test("Invalid password", async () => {
        const loginDetails = {
            email: "test9@gmail.com",
            password: "1234567",
        };
        const invalidPasswordLogin = await supertest(app)
            .post("/users/login")
            .send(loginDetails);

        const { body, statusCode } = invalidPasswordLogin;
        expect(statusCode).toBe(400);
        expect(body["message"]).toBe("Invalid password");
    });
    test("Successful login", async () => {
        const loginDetails = {
            email: "test9@gmail.com",
            password: "123456",
        };
        const successfulLogin = await supertest(app)
            .post("/users/login")
            .send(loginDetails);

        const { body, statusCode } = successfulLogin;
        expect(statusCode).toBe(200);
        expect(body["message"]).toBe("Login successful");
        expect(body).toHaveProperty("token");
    });
});

// ==================GET==================
describe("[GET] Get User by given database ID", () => {
    let validId;
    let nonexistentId = newObjectId();
    let invalidId = "123456";
    beforeEach(async () => {
        const getUsers = await supertest(app).get("/users");
        const { body } = getUsers;
        validId = body[0]["_id"];
    });

    test("User with Database ID exists", async () => {
        const userWithDbId = await supertest(app).get(`/users/db/${validId}`);
        const { statusCode, body } = userWithDbId;
        // found
        expect(statusCode).toBe(200);
    });

    test("User with Database ID does not exist", async () => {
        const userWithoutDbId = await supertest(app).get(
            `/users/${nonexistentId}`
        );

        // not found
        expect(userWithoutDbId.statusCode).toBe(404);
        expect(userWithoutDbId.body["message"]).toBe("User does not exist");
    });

    test("User with Database ID is invalid", async () => {
        const userWithoutDbId = await supertest(app).get(
            `/users/db/${invalidId}`
        );

        // does not exist
        expect(userWithoutDbId.statusCode).toBe(404);
        expect(userWithoutDbId.body["message"]).toBe("User does not exist");
    });
});

// the 'url'
describe("[GET] Get User by given generated ID", () => {
    let validId;
    let nonexistentId = newObjectId();
    beforeEach(async () => {
        await supertest(app)
            .get("/users")
            .then((res) => {
                const { body } = res;
                validId = body[0]["shortenedURL"];
            });
    });
    test("User with Generated ID exists", async () => {
        const userWithGenId = await supertest(app).get(`/users/id/${validId}`);
        // found
        expect(userWithGenId.statusCode).toBe(200);
    });

    test("User with Generated ID does not exist", async () => {
        const userWithoutGenId = await supertest(app).get(
            `/users/id/${nonexistentId}`
        );

        // not found
        expect(userWithoutGenId.statusCode).toBe(404);
        expect(userWithoutGenId.body["message"]).toBe("User does not exist");
    });
});

// username
describe("[GET] Get User by username", () => {
    let validUserName;
    let nonexistentUsername = "nonexistentname";
    beforeEach(async () => {
        await supertest(app)
            .get("/users")
            .then((res) => {
                const { body } = res;
                validUserName = body[0]["username"];
            });
    });
    test("User with username exists", async () => {
        const userWithUsername = await supertest(app).get(
            `/users/${validUserName}`
        );
        // found
        expect(userWithUsername.statusCode).toBe(200);
    });

    test("User with username does not exist", async () => {
        const userWithoutUserName = await supertest(app).get(
            `/users/${nonexistentUsername}`
        );

        // not found
        expect(userWithoutUserName.statusCode).toBe(404);
        expect(userWithoutUserName.body["message"]).toBe("User does not exist");
    });
});

// ==================PUT==================
// change username
describe("[PUT] Changing of username (authorised)", () => {
    var validToken = null;
    let currentUserId;
    let validUserName;

    beforeEach(async () => {
        const credentials = {
            email: "test9@gmail.com",
            password: "123456",
        };
        const loginUser = await supertest(app)
            .post("/users/login")
            .send(credentials);
        const { body } = loginUser;
        const { token, userId } = body;
        currentUserId = userId;
        validToken = token;

        await supertest(app)
            .get("/users")
            .then((res) => {
                const { body } = res;
                validUserName = body[0]["username"];
            });
    });

    test("User does not exist", async () => {
        const nonexistentId = newObjectId();
        const nonexistentUser = await supertest(app)
            .put(`/users/${nonexistentId}`)
            .set("Authorization", "Bearer " + validToken)
            .send({
                username: "invalidpass",
            });

        // not found
        expect(nonexistentUser.statusCode).toBe(403);
        expect(nonexistentUser.body["message"]).toBe("Unauthorised");
    });
    test("Change to an already taken username", async () => {
        const getAllUsers = await supertest(app).get("/users");
        const { body } = getAllUsers;
        const takenUserName = body[0]["username"];

        const usernameExists = await supertest(app)
            .put(`/users/${currentUserId}`)
            .set("Authorization", "Bearer " + validToken)
            .send({
                username: takenUserName,
            });
        expect(usernameExists.statusCode).toBe(500);
        expect(usernameExists.body["message"]).toBe("Username already exists");
    });
    test("Change to a brand new username", async () => {
        const newUsername = "A changed user";
        const changeUsernameSuccessful = await supertest(app)
            .put(`/users/${currentUserId}`)
            .set("Authorization", "Bearer " + validToken)
            .send({
                username: newUsername,
            });
        expect(changeUsernameSuccessful.statusCode).toBe(200);
        expect(changeUsernameSuccessful.body["message"]).toBe(
            "Username successfully changed"
        );
    });
});

// refresh link
describe("[PUT] Refreshing gen ID of user (authorised)", () => {
    var validToken = null;
    let currentUserId;
    // let validUserName;

    beforeEach(async () => {
        const credentials = {
            email: "test9@gmail.com",
            password: "123456",
        };
        await supertest(app)
            .post("/users/login")
            .send(credentials)
            .then((res) => {
                const { body } = res;
                const { token, userId } = body;
                currentUserId = userId;
                validToken = token;
            });

        await supertest(app)
            .get("/users")
            .then((res) => {
                const { body } = res;
                // validUserName = body[0]["username"];
            });
    });

    test("User does not exist", async () => {
        const nonexistentId = newObjectId();
        const nonexistentUser = await supertest(app)
            .put(`/users/r/${nonexistentId}`)
            .set("Authorization", "Bearer " + validToken);

        // not found
        expect(nonexistentUser.statusCode).toBe(403);
        expect(nonexistentUser.body["message"]).toBe("Unauthorised");
    });

    test("User exists, refresh successful", async () => {
        // const userPreviousGenId = body[0]["shortenedURL"];

        const changeUserGenID = await supertest(app)
            .put(`/users/r/${currentUserId}`)
            .set("Authorization", "Bearer " + validToken);
        const { statusCode, body } = changeUserGenID;

        expect(statusCode).toBe(200);
        expect(body["message"]).toBe("URL successfully refreshed");
        // expect(changeUserGenID.body["shortenedURL"]).not.toBe(
        //     userPreviousGenId
        // );
    });
});

// ==================DELETE==================
// delete user by database ID
describe("[DELETE] Deleting user by Database ID", () => {
    let validToken = null;
    let currentUserId;

    beforeEach(async () => {
        const loginMock = await supertest(app).post("/users/login").send({
            email: "test7@gmail.com",
            password: "123456",
        });

        const { body } = loginMock;
        const { token, userId } = body;
        currentUserId = userId;
        validToken = token;
    });

    test("User does not exist", async () => {
        const nonexistentId = newObjectId();
        const deleteNonexistentUser = await supertest(app)
            .delete(`/users/${nonexistentId}`)
            .set("Authorization", "Bearer " + validToken);

        // not found
        expect(deleteNonexistentUser.statusCode).toBe(403);
        expect(deleteNonexistentUser.body["message"]).toBe("Unauthorised");
    });

    test("User exists, delete successful", async () => {
        const deleteUser = await supertest(app)
            .delete(`/users/${currentUserId}`)
            .set("Authorization", "Bearer " + validToken);
        expect(deleteUser.statusCode).toBe(200);
        expect(deleteUser.body["message"]).toBe("User successfully deleted");

        const deleteUserAgain = await supertest(app).delete(
            `/users/${currentUserId}`
        );
        expect(deleteUserAgain.statusCode).toBe(403);
        expect(deleteUserAgain.body["message"]).toBe("Unauthorised");
    });
});

describe("[PUT/DELETE] Testing of protection middleware", () => {
    var validToken = null;
    var invalidToken = "testing";
    var randomID = newObjectId();
    var validId; //this is the target of deleting/changing
    var testId; //
    beforeEach(async () => {
        const credentials = {
            email: "test9@gmail.com",
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
        validId = getUsersBody[0]["userId"];
    });

    test("No JWT inside", async () => {
        // ===========change username===========
        const noJWTChangeName = await supertest(app)
            .put(`/users/${validId}`)
            .send({
                username: "testuser1",
            });
        const {
            statusCode: noJWTChangeNameStatusCode,
            body: noJWTChangeNameBody,
        } = noJWTChangeName;
        expect(noJWTChangeNameStatusCode).toBe(403);
        expect(noJWTChangeNameBody.message).toBe("Unauthorised");

        // ===========refresh===========
        const nowJWTRefresh = await supertest(app).put(`/users/r/${validId}`);
        const { statusCode: nowJWTRefreshStatusCode, body: nowJWTRefreshBody } =
            nowJWTRefresh;
        expect(nowJWTRefreshStatusCode).toBe(403);
        expect(nowJWTRefreshBody.message).toBe("Unauthorised");

        // ===========delete user===========
        const nowJWTDeleteUser = await supertest(app).delete(
            `/users/${validId}`
        );
        const {
            statusCode: nowJWTDeleteUserStatusCode,
            body: nowJWTDeleteUserBody,
        } = nowJWTDeleteUser;
        expect(nowJWTDeleteUserStatusCode).toBe(403);
        expect(nowJWTDeleteUserBody.message).toBe("Unauthorised");
    });

    test("Invalid JWT inside", async () => {
        // ===========change username===========
        const invalidJWTChangeName = await supertest(app)
            .put(`/users/${validId}`)
            .set("Authorization", "Bearer " + invalidToken)
            .send({
                username: "testuser2345",
            });
        const {
            statusCode: invalidJWTChangeNameStatusCode,
            body: invalidJWTChangeNameBody,
        } = invalidJWTChangeName;
        expect(invalidJWTChangeNameStatusCode).toBe(403);
        expect(invalidJWTChangeNameBody.message).toBe("Unauthorised");

        // ===========refresh===========
        const invalidJWTRefresh = await supertest(app)
            .put(`/users/r/${validId}`)
            .set("Authorization", "Bearer " + invalidToken);
        const {
            statusCode: invalidJWTRefreshStatusCode,
            body: invalidJWTRefreshBody,
        } = invalidJWTRefresh;
        expect(invalidJWTRefreshStatusCode).toBe(403);
        expect(invalidJWTRefreshBody.message).toBe("Unauthorised");

        // ===========delete user===========
        const invalidJWTDeleteUser = await supertest(app)
            .delete(`/users/${validId}`)
            .set("Authorization", "Bearer " + invalidToken);
        const {
            statusCode: invalidJWTDeleteUserStatusCode,
            body: invalidJWTDeleteUserBody,
        } = invalidJWTDeleteUser;
        expect(invalidJWTDeleteUserStatusCode).toBe(403);
        expect(invalidJWTDeleteUserBody.message).toBe("Unauthorised");
    });
    test("JWT user and queried user mismatch", async () => {
        // ===========change username===========
        const mismatchChangeUsername = await supertest(app)
            .put(`/users/${validId}`)
            .set("Authorization", "Bearer " + validToken)
            .send({
                username: "testuser12345",
            });
        const {
            statusCode: mismatchChangeUsernameStatusCode,
            body: mismatchChangeUsernameBody,
        } = mismatchChangeUsername;
        expect(mismatchChangeUsernameStatusCode).toBe(403);
        expect(mismatchChangeUsernameBody.message).toBe("Unauthorised");

        // ===========refresh===========
        const mismatchRefresh = await supertest(app)
            .put(`/users/r/${validId}`)
            .set("Authorization", "Bearer " + validToken);
        const {
            statusCode: mismatchRefreshStatusCode,
            body: mismatchRefreshBody,
        } = mismatchRefresh;
        expect(mismatchRefreshStatusCode).toBe(403);
        expect(mismatchRefreshBody.message).toBe("Unauthorised");

        // ===========delete user===========
        const mismatchDeleteUser = await supertest(app)
            .delete(`/users/${validId}`)
            .set("Authorization", "Bearer " + invalidToken);
        const {
            statusCode: mismatchDeleteUserStatusCode,
            body: mismatchDeleteUserBody,
        } = mismatchDeleteUser;
        expect(mismatchDeleteUserStatusCode).toBe(403);
        expect(mismatchDeleteUserBody.message).toBe("Unauthorised");
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
