const express = require('express');
const router = express.Router();
const sql = require('mssql');

router.get('/', async (req, res) => {
    try{
        const result = await sql.query('SELECT * FROM Students');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send('Database Error: ' + err.message);
    };
});

module.exports = router;