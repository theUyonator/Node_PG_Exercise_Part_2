/** Routes for industries  */

const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");


router.get('/', async (req, res, next) => {
    try{
        const results = await db.query(`SELECT * FROM industries`);
        return res.json({ industries: results.rows });
    }catch(e){
        return next(e);
    }
})

router.get('/:code', async (req, res, next) => {
    try{
        const results = await db.query(`
        SELECT i.code, i.industry, c.name
            FROM industries AS i
                LEFT JOIN companies_industries AS ci
                    ON i.code = ci.industry_code
                LEFT JOIN companies as c 
                    ON ci.comp_code = c.code
             WHERE i.code = $1`, 
             [req.params.code]);
        // console.log(results);
        if(results.rows.length === 0){
            throw new ExpressError(`Can't find industry with code of ${req.params.code}`, 404);
        }
        let { code, industry } = results.rows[0];
        let companies = results.rows.map(c => c.name);

        return res.json({ industry: {code, industry, companies}});
    }catch(e){
        return next(e);
    }
})

router.post('/', async (req, res, next) => {
    try{
        const { code, industry } = req.body;
        const results = await db.query(
            `INSERT INTO industries (code, industry)
            VALUES ($1, $2)
            RETURNING code, industry`,
            [code, industry]);
        return res.status(201).json({ industry: results.rows[0] });
    }catch(e){
        return next(e);
    }
})

router.put('/:code', async (req, res, next) =>{
    try{
        const { code } = req.params;
        const { newcode, industry } = req.body;
        if(!industry){
            throw new ExpressError(`Enter industry`, 400)
        }
        const results = await db.query(
            `UPDATE industries SET code=$1, industry=$2
            WHERE code=$3 RETURNING code, industry`,
            [newcode, industry, code]
        );
        if(results.rows.length === 0) {
            throw new ExpressError(`Can't find industry with code of ${code}`, 404)
        }
        return res.json({ industry: results.rows[0] })

    }catch(e){
        return next(e);
    }
})

// route to associate an industry with a company
router.post('/companies', async (req, res, next) =>{
    try{
        const { comp_code, industry_code } = req.body;
        const company = await db.query(`SELECT * FROM companies WHERE code =  $1`, [comp_code]);
        const industry = await db.query(`SELECT * FROM industries WHERE code =  $1`, [industry_code]);

        if(company.rows.length === 0 || industry.rows.length === 0){
            throw new ExpressError(`Provide valid company code and industry code`, 404);
        }

        const results = await db.query(
            `INSERT INTO companies_industries (comp_code, industry_code)
                VALUES ($1, $2)
                RETURNING comp_code, industry_code`,
                [comp_code, industry_code]
        )
        return res.status(201).json({ msg: "added" })

    }catch(e){
        return next(e);
    }
})

router.delete('/:code', async (req, res, next) => {
    try{
        const results = db.query('DELETE FROM industries WHERE code = $1', [req.params.code]);
        return res.json({ status: "deleted" })

    } catch(e){
        return next(e);
    }
})

module.exports = router;