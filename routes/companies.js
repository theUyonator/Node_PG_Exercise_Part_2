/** Routes for companies  */

const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");
const slugify = require("slugify");


router.get('/', async (req, res, next) => {
    try{
        const results = await db.query(`SELECT * FROM companies`);
        return res.json({ companies: results.rows });
    }catch(e){
        return next(e);
    }
})

router.get('/:code', async (req, res, next) => {
    try{
        // const { code } = req.params;
        const results = await db.query(`
        SELECT c.code, c.name, c.description, i.industry 
            FROM companies AS c
                LEFT JOIN companies_industries AS ci
                    ON c.code = ci.comp_code
                LEFT JOIN industries as i 
                    ON ci.industry_code = i.code
             WHERE c.code = $1`, 
             [req.params.code]);
        console.log(results);
        if(results.rows.length === 0){
            throw new ExpressError(`Can't find company with code of ${req.params.code}`, 404);
        }
        let { code, name, description } = results.rows[0];
        let industries = results.rows.map(ind => ind.industry);
        // console.log(code, name, description, industries);

        const iResults = await db.query(`SELECT * FROM invoices WHERE comp_code = $1`, [req.params.code]);
        const invoices = iResults.rows.map(i => [i.id, i.comp_code, i.amt, i.paid, i.add_date, i.paid_date])
        // console.log(invoices)
        // results.rows[0].industries = industries;
        // results.rows[0].invoices = invoices;
        return res.json({ company: {code, name, description, industries, invoices}});
    }catch(e){
        return next(e);
    }
})

router.post('/', async (req, res, next) => {
    try{
        const { name, description } = req.body;
        const code = slugify(name, {lower: true});
        const results = await db.query(
            `INSERT INTO companies (code, name, description)
            VALUES ($1, $2, $3)
            RETURNING code, name, description`,
            [code, name, description]);
        return res.status(201).json({ company: results.rows[0] });
    }catch(e){
        return next(e);
    }
})

router.put('/:code', async (req, res, next) =>{
    try{
        const { code } = req.params;
        const { name, description } = req.body;
        if(!name || !description){
            throw new ExpressError(`Enter both name and description to update`, 400)
        }
        const results = await db.query(
            `UPDATE companies SET name=$1, description=$2
            WHERE code=$3 RETURNING code, name, description`,
            [name, description, code]
        );
        if(results.rows.length === 0) {
            throw new ExpressError(`Can't find comapny with code of ${code}`, 404)
        }
        return res.json({ company: results.rows[0] })

    }catch(e){
        return next(e);
    }
})

router.delete('/:code', async (req, res, next) => {
    try{
        const results = db.query('DELETE FROM companies WHERE code = $1', [req.params.code]);
        return res.json({ status: "deleted" })

    } catch(e){
        return next(e);
    }
})

module.exports = router;