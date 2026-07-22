const express = require('express')
const mysql = require('mysql2')
const cors = require('cors')
require('dotenv').config()

const app = express()
app.use(cors())
app.use(express.json())

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: `${process.env.SQL_PASSWORD}`,
    database: 'transaction'
})

app.get('/api/get-transactions', (req, res) => {
    connection.query(
        'SELECT * FROM transaction',
        (err, results) => {
            if (err) throw err;
            res.json(results)
        }
    )
})

app.post('/api/add-new-transaction', (req, res) => {
    const {
        descricao,
        categoria,
        tipo,
        valor,
        data
    } = req.body

    const sql = `
        insert into \`transaction\`
        (descricao, categoria, tipo, valor, data)
        values (?,?,?,?,?)
    `

    connection.query(
        sql, [descricao, categoria, tipo, valor, data],
        (erro, resultado) => {
            if (erro) {
                console.error(erro)

                return res.status(500).json({
                    erro: 'Erro ao criar transação'
                })
            }

            res.status(201).json({
                mensagem: 'Nova transação criada com sucesso',
                id: resultado.insertId
            })
        }
    )

})

app.delete('/api/delete-transaction', (req, res) => {
    const {
        id
    } = req.body
    const sql = `
    delete from transaction where id = ?
    `
    connection.query(
        sql, [id],
        (erro, resultado) => {
            if (erro) {
                console.error(erro)
                return res.status(500).json({
                    erro: 'Erro ao deletar transação'
                })
            }
            return res.status(201).json({
                mensagem: 'Transação deletada com sucesso'
            })
        }
    )
})


app.post('/api/get-transaction-by-id', (req, res) => {
    const {
        id
    } = req.body
    connection.query(
        'SELECT * FROM transaction where id = (?)', [id],
        (err, results) => {
            if (err) {
                console.error(err)
                return res.status(500).json({
                    erro: 'Erro ao buscar transação'
                })
            }
            return res.json({
                mensagem: 'Busca por transação feita com sucesso',
                resultado: results
            })
        }
    )
})

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000')
})