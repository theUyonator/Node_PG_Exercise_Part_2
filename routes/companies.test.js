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
        expect(res.body).toEqual({ companies: [
            {code: "apple", name:"Apple", description: "Maker of the IOS"},
            {code: "ibm", name: "IBM", description: "inventor of the first micro chip"}
        ]});
    })
})

describe("GET /apple", ()=>{
    test("Get a apple including industries and invoices", async () =>{
        const response = await request(app).get("/companies/apple")
        expect(response.body).toEqual(
            {
                "company": {
                  code: "apple",
                  name: "Apple",
                  description: "Maker of the IOS",
                  industries: ["Technology", "Management"],
                  invoices: [
                    [1, 'apple', 100, false, '2018-01-01T07:00:00.000Z', null],
                    [2, 'apple', 200, true, '2018-02-01T07:00:00.000Z', '2018-02-02T07:00:00.000Z']
                ]
                }
            }

        )
    });

    test("Should return 404 for invalid company", async function (){
        const response = await request(app).get("/companies/nsjjd");
        expect(response.status).toEqual(404);
    })
})

describe("POST /", () => {
    test('It should add a new company', async function () {
        const response = await request(app)
                .post("/companies")
                .send({name: "KFC", description:"Number 1 fried chicken"});

        expect(response.status).toBe(201);
        expect(response.body).toEqual(
            {
                "company": {
                    code: "kfc",
                    name: "KFC",
                    description: "Number 1 fried chicken"
                 }
            }
        )
    });
})

describe("PUT /", () =>{
    test("It should update company info", async () =>{
        const response = await request(app)
                .put("/companies/apple")
                .send({name: "AppleTest", description: "Test apple"});

        expect(response.body).toEqual(
            {
                "company": {
                    code: "apple",
                    name: "AppleTest",
                    description: "Test apple",
                }
            }
        )
    });

    test("It should return a status code of 404 if invalid code", async () =>{
        const response = await request(app)
                .put("/companies/appe")
                .send({name: "AppleTest", description: "Test apple"});

        expect(response.status).toBe(404);

    })
})


describe("DELETE /", function () {

    test("It should delete company", async function () {
      const response = await request(app)
          .delete("/companies/apple");
  
      expect(response.body).toEqual({"status": "deleted"});
    });
  
  });
  