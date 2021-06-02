// We have to specifically tell Node we're in test "mode"

process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');

// Set up
let testInvoice;
beforeEach(async () =>{
    
    let result = await db.query(`
    INSERT INTO invoices (comp_code, amt, paid, paid_date)
    VALUES ('testcompany', 500, false, null)
    RETURNING id, comp_code, amt, paid, add_date, paid_date `);
    // console.log(result);
    testInvoice = result.rows[0];
    console.log(testInvoice);
})

// Tear down at the end 
afterEach(async function(){
    // delete any data created by test 
    await db.query("DELETE FROM invoices");
});

afterAll(async function(){
    // close db connection 
    await db.end();
})

// console.log(testInvoice);
describe("GET /invoices", () =>{
    test("Get a list with one invoice", async () => {
        const res = await request(app).get('/invoices');
        console.log(testInvoice);
        // console.log(res.body);
        expect(res.statusCode).toBe(200);
        // expect(res.body).toEqual({ invoices: [testInvoice]});
    })
})