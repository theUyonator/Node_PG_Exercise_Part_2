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
            {id: 1, comp_code: 'apple', amt: 100, paid: false, add_date: '2018-01-01', paid_date: null},
            {id: 2, comp_code: 'apple', amt: 200, paid: true, add_date: '2018-02-01', paid_date: '2018-02-02'},
            {id: 3, comp_code: 'ibm', amt: 300, paid: false, add_date: '2018-03-01', paid_date: null}
        ]});
    })
})