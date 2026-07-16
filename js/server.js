const express = require('express')
const mysql = require('mysql2')
const cors = require('cors')
require('dotenv').config()

const app = express()
app.use(cors())

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: `${process.env.SQL_PASSWORD}`,
    database: 'transaction'
})

app.get('/api/transaction', (req, res) => {
    connection.query(
        'SELECT * FROM transaction',
        (err, results) => {
            if (err) throw err;
            res.json(results)
        }
    )
})

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000')
})