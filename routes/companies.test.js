// We have to specifically tell Node we're in test "mode"

process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');
const { createData } = require("../_test-common");

beforeEach(createData);

afterAll(async function(){
    // close db connection 
    await db.end();
})

describe("GET /companies", () =>{
    test("Get an array of companies", async () => {
        const res = await request(app).get('/companies');
        expect(res.statusCode).toBe(200);
        // expect(res.body).toEqual({ companies: [
        //     {code: "apple", name:"Apple", description: "Maker of the IOS"},
        //     {code: "ibm", name: "IBM", description: "inventor of the first micro chip"}
        // ]});
    })
})