/**This file holds code common to both tests */

const db = require("./db");

async function createData(){
    await db.query("DELETE FROM companies");
    await db.query("DELETE FROM invoices");
    // This line makes sure that the ids set for invoices remain the same 
    // as data is being entered and removed from the test db.
    await db.query("SELECT setval('invoices_id_seq', 1, false)");

    await db.query(`
    INSERT INTO companies (code, name, description)
    VALUES ('apple', 'Apple', 'Maker of the IOS'),
           ('ibm', 'IBM', 'inventor of the first micro chip')`);

    const inv = await db.query(
    `INSERT INTO invoices (comp_code, amt, paid, add_date, paid_date)
        VALUES ('apple', 100, false, '2018-01-01', null),
                ('apple', 200, true, '2018-02-01', '2018-02-02'), 
                ('ibm', 300, false, '2018-03-01', null)
        RETURNING id`);
}

module.exports = { createData }