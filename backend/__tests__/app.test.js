const request = require("supertest");
const app = require("../app");

describe("Health check", () => {
    test("API even running", async () => {
        const response = await request(app).get("/");
        expect(response.statusCode).toBe(200);
    });
});

