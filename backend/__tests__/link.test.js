const supertest = require("supertest");
const app = require("../app");
const { seedUsers, seedLinks } = require("../helperFunctions/dbHelpers");
const { newObjectId } = require("../helperFunctions/idGenerator");

const {
    resetTestDB,
    initialiseConnection,
    cutConnection,
} = require("../helperFunctions/dbConnection");






/* Connecting to the database before each test. */
beforeAll(async () => {
    await initialiseConnection().then(async () => {
        await resetTestDB();
        await seedUsers();
        await seedLinks();
    });
});

/* Closing database connection after each test. */
afterAll(async () => {
    await resetTestDB().then(async () => {
        await cutConnection();
    });
});
