/** Routes for invoices  */

const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");


router.get('/', async (req, res, next) => {
    try{
        const results = await db.query(`SELECT * FROM invoices`);
        return res.json({ invoices: results.rows });
    }catch(e){
        return next(e);
    }
})

router.get('/:id', async (req, res, next) => {
    try{
        const { id } = req.params;
        const iResults = await db.query(`SELECT * FROM invoices WHERE id =  $1`, [id]);
        if(iResults.rows.length === 0){
            throw new ExpressError(`Can't find invoice with id of ${id}`, 404);
        }
        const cResults = await db.query(`SELECT * FROM companies WHERE code = $1`, [iResults.rows[0].comp_code])
        return res.json({ invoice: iResults.rows[0], company: cResults.rows[0]});
    }catch(e){
        return next(e);
    }
})

router.post('/', async (req, res, next) => {
    try{
        const { comp_code, amt } = req.body;
        if(!comp_code || !amt){
            throw new ExpressError(`Enter both comp_code and amount`, 400);
        }
        if(isNaN(amt)){
            throw new ExpressError(`${amt} is not a valid number`, 400);
        }
        const results = await db.query(
            `INSERT INTO invoices (comp_code, amt)
            VALUES ($1, $2)
            RETURNING id, comp_code, amt, paid, add_date, paid_date`,
            [comp_code, amt]);
        return res.status(201).json({ invoice: results.rows[0] });
    }catch(e){
        return next(e);
    }
})

router.patch('/:id', async (req, res, next) =>{
    try{
        const { id } = req.params;
        const { amt } = req.body;
        if(!amt || isNaN(amt)){
            throw new ExpressError(`Enter valid number as amount to update`, 400)
        }
        const results = await db.query(
            `UPDATE invoices SET amt=$2
            WHERE id=$1 RETURNING id, comp_code, amt, paid, add_date, paid_date`,
            [id, amt]
        );
        if(results.rows.length === 0) {
            throw new ExpressError(`Can't find invoice with id of ${id}`, 404)
        }
        return res.json({ invoice: results.rows[0] })

    }catch(e){
        return next(e);
    }
})

router.delete('/:id', async (req, res, next) => {
    try{
        const results = db.query('DELETE FROM invoices WHERE id = $1', [req.params.id]);
        return res.json({ status: "deleted" })

    } catch(e){
        return next(e);
    }
})

module.exports = router;