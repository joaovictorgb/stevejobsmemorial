const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

// Inicializa o banco de dados SQLite (persistente agora)
const db = new sqlite3.Database('./depoimentos.db');  // Certifique-se de que o banco está persistente

// Cria a tabela de depoimentos se ela não existir
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS depoimentos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            mensagem TEXT NOT NULL
        )
    `);
});

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Rota para buscar todos os depoimentos (READ)
app.get('/api/depoimentos', (req, res) => {
    db.all('SELECT * FROM depoimentos', [], (err, rows) => {
        if (err) {
            res.status(500).send('Erro no servidor');
        } else {
            res.json(rows);
        }
    });
});

// Rota para adicionar um novo depoimento (CREATE)
app.post('/api/depoimentos', (req, res) => {
    const { nome, mensagem } = req.body;
    if (!nome || !mensagem) {
        res.status(400).send('Nome e mensagem são obrigatórios');
        return;
    }
    db.run(
        'INSERT INTO depoimentos (nome, mensagem) VALUES (?, ?)',
        [nome, mensagem],
        function(err) {
            if (err) {
                res.status(500).send('Erro no servidor');
            } else {
                res.json({ id: this.lastID, nome, mensagem });
            }
        }
    );
});

// Inicia o servidor
const PORT = 5001;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
