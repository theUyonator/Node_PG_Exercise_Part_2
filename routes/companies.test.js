// We have to specifically tell Node we're in test "mode"

process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');

// Set up
let testCompany;
beforeEach(async () =>{
    let result = await db.query(`
    INSERT INTO companies 
    VALUES ('testcompany', 'Test Company', 'This is a test company.')
    RETURNING code, name, description`);
    testCompany = result.rows[0];
})

// Tear down at the end 
afterEach(async function(){
    // delete any data created by test 
    await db.query("DELETE FROM companies");
});

afterAll(async function(){
    // close db connection 
    await db.end();
})

describe("GET /companies", () =>{
    test("Get a list with one company", async () => {
        const res = await request(app).get('/companies');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ companies: [testCompany]});
    })
})