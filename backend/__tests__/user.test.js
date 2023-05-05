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
        expect(userWithoutDbId.statusCode).toBe(404);
        expect(userWithoutDbId.body["message"]).toBe("User does not exist");
    });
});

// the 'url'
describe("[GET] Get User by given generated ID", () => {
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
describe("[GET] Get User by username", () => {
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

// ==================PUT==================
// change username
describe("[PUT] Changing of username (authorised)", () => {
    var validToken = null;

    beforeEach(function (done) {
        const credentials = {
            email: "test9@gmail.com",
            password: "123456",
        };
        supertest(app)
            .post("/user/token")
            .send(credentials)
            .end(function (err, res) {
                validToken = res.body.token; // Or something
                done();
            });
        console.log("validToken", validToken);
    });

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
        const newUsername = "A changed user";
        const targetUserId = body[1]["_id"];

        const changeUsernameSuccessful = await supertest(app)
            .put(`/users/${targetUserId}`)
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
describe("[PUT] Refreshing gen ID of user", () => {
    test("User does not exist", async () => {
        const nonexistentId = newObjectId();
        const nonexistentUser = await supertest(app).put(
            `/users/r/${nonexistentId}`
        );

        // not found
        expect(nonexistentUser.statusCode).toBe(404);
        expect(nonexistentUser.body["message"]).toBe("User does not exist");
    });
    test("User exists, refresh successful", async () => {
        const getAllUsers = await supertest(app).get("/users");
        const { body } = getAllUsers;
        const targetUserId = body[0]["_id"];
        const userPreviousGenId = body[0]["shortenedURL"];

        const changeUserGenID = await supertest(app).put(
            `/users/r/${targetUserId}`
        );

        expect(changeUserGenID.statusCode).toBe(200);
        expect(changeUserGenID.body["message"]).toBe(
            "URL successfully refreshed"
        );
        expect(changeUserGenID.body["shortenedURL"]).not.toBe(
            userPreviousGenId
        );
    });
});

// ==================DELETE==================
// delete user by database ID
describe("[DELETE] Deleting user by Database ID", () => {
    test("User does not exist", async () => {
        const nonexistentId = newObjectId();
        const deleteNonexistentUser = await supertest(app).delete(
            `/users/${nonexistentId}`
        );

        // not found
        expect(deleteNonexistentUser.statusCode).toBe(404);
        expect(deleteNonexistentUser.body["message"]).toBe(
            "User does not exist"
        );
    });
    test("User exists, delete successful", async () => {
        const getAllUsers = await supertest(app).get("/users");
        const { body } = getAllUsers;
        const targetUserId = body[0]["_id"];
        const deleteUser = await supertest(app).delete(
            `/users/${targetUserId}`
        );
        expect(deleteUser.statusCode).toBe(200);
        expect(deleteUser.body["message"]).toBe("User successfully deleted");

        const deleteUserAgain = await supertest(app).delete(
            `/users/${targetUserId}`
        );
        expect(deleteUserAgain.statusCode).toBe(404);
        expect(deleteUserAgain.body["message"]).toBe("User does not exist");
    });
});

describe("[PUT/DELETE] Testing of protection middleware", () => {
    var validToken = null;
    var invalidToken = "testing";
    var randomID = newObjectId();
    beforeEach((done) => {
        const credentials = {
            email: "test9@gmail.com",
            password: "123456",
        };
        supertest(app)
            .post("/user/token")
            .send(credentials)
            .end(function (err, res) {
                validToken = res.body.token; // Or something
                done();
            });
        console.log("validToken", validToken);
    });

    test("No JWT inside", async () => {
        // ===========change username===========
        const noJWTChangeName = await supertest(app)
            .put(`/users/${randomID}`)
            .send({
                username: "testuser1",
            });
        const {
            statusCode: noJWTChangeNameStatusCode,
            body: noJWTChangeNameBody,
        } = noJWTChangeName;
        expect(noJWTChangeNameStatusCode).toBe(403);
        expect(noJWTChangeNameBody.message).toBe("Invalid token");

        // ===========refresh===========
        const nowJWTRefresh = await supertest(app).put(
            `/users/r/${targetUserId}`
        );
        // ===========delete user===========
        const deleteuserRefresh = await supertest(app);
    });

    test("Invalid JWT inside", async () => {
        // ===========change username===========
        const invalidJWTChangeName = await supertest(app)
            .set("Authorization", "Bearer " + invalidToken)
            .put(`/users/${randomID}`)
            .send({
                username: "testuser2345",
            });
        const { statusCode, body } = invalidJWTChangeName;
        expect(statusCode).toBe(403);
        expect(body.message).toBe("Invalid token");

        // ===========refresh===========
        // ===========delete user===========
    });
    test("JWT user and queried user mismatch", async () => {
        // ===========change username===========
        // ===========refresh===========
        // ===========delete user===========
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
