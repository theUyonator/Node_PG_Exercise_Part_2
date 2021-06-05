// We have to specifically tell Node we're in test "mode"

process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');
const { createData } = require("../_test-common");

// Set up
beforeEach(createData)

afterAll(async function(){
    // close db connection 
    await db.end();
})

// console.log(testInvoice);
describe("GET /invoices", () =>{
    test("Get an array with all invoices", async () => {
        const res = await request(app).get('/invoices');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ invoices: [
            {id: 1, comp_code: 'apple', amt: 100, paid: false, add_date: '2018-01-01T07:00:00.000Z', paid_date: null},
            {id: 2, comp_code: 'apple', amt: 200, paid: true, add_date: '2018-02-01T07:00:00.000Z', paid_date: '2018-02-02T07:00:00.000Z'},
            {id: 3, comp_code: 'ibm', amt: 300, paid: false, add_date: '2018-03-01T07:00:00.000Z', paid_date: null}
        ]});
    })
})

describe("GET /:id", ()=>{
    test("Get an invoice incluiding the company", async () =>{
        const response = await request(app).get("/invoices/1")
        expect(response.body).toEqual(
            { 
                invoice: {id: 1, comp_code: 'apple', amt: 100, paid: false, add_date: '2018-01-01T07:00:00.000Z', paid_date: null},
                company: {
                    code: "apple",
                    name: "Apple",
                    description: "Maker of the IOS"
                  }
            }
        )
    });

    test("Should return 404 for invalid invoice", async function (){
        const response = await request(app).get("/invoices/40");
        expect(response.status).toEqual(404);
    })

});

describe("POST /", () => {
    test('It should add a new invoice', async function () {
        const response = await request(app)
                .post("/invoices")
                .send({comp_code: "ibm", amt: 450});

        expect(response.status).toBe(201);
        expect(response.body).toEqual(
            {
                "invoice": {
                    id: 4,
                    comp_code: "ibm",
                    amt: 450,
                    paid: false,
                    add_date:'2021-06-05T06:00:00.000Z',
                    paid_date: null
                 }
            }
        )
    });
})


describe("PATCH /", () =>{
    test("It should update invoice info", async () =>{
        const response = await request(app)
                .patch("/invoices/1")
                .send({amt: 380, paid: true});

        expect(response.body).toEqual(
            {
                "invoice": {
                    id: 1, 
                    comp_code: 'apple', 
                    amt: 380, 
                    paid: true, 
                    add_date: '2018-01-01T07:00:00.000Z', 
                    paid_date: '2021-06-05T06:00:00.000Z'
                }
            }

        )
    });

    test("It should return a status code of 404 if invalid invoice", async () =>{
        const response = await request(app)
                .patch("/invoices/50")
                .send({amt: 380, paid: true});

        expect(response.status).toBe(404);

    })
})


describe("DELETE /", function () {

    test("It should an invoice", async function () {
      const response = await request(app)
          .delete("/invoices/1");
  
      expect(response.body).toEqual({"status": "deleted"});
    });
  
  });
