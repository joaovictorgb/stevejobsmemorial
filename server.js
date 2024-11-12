const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Inicializar o banco de dados
const db = new sqlite3.Database('./profile.db', (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite.');
        db.serialize(() => {
            db.run(`
                CREATE TABLE IF NOT EXISTS profile (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT,
                    bio TEXT,
                    email TEXT UNIQUE,
                    password TEXT
                )
            `, (err) => {
                if (err) {
                    console.error('Erro ao criar tabela profile:', err.message);
                } else {
                    db.run(`INSERT OR IGNORE INTO profile (id, name, bio, email, password) VALUES (1, 'João Victor', 'João Victor é um designer UX/UI com mais de 7 anos de experiência criando experiências de usuário limpas e envolventes. Apaixonado por tecnologia, criatividade e como elas podem fazer a diferença na vida das pessoas. Sempre buscando aprender e inovar.', 'joaovgb5@gmail.com', '123')`);
                }
            });

            db.run(`
                CREATE TABLE IF NOT EXISTS quotes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    quote TEXT
                )
            `, (err) => {
                if (err) {
                    console.error('Erro ao criar tabela quotes:', err.message);
                }
            });

            db.run(`
                CREATE TABLE IF NOT EXISTS events (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT,
                    date TEXT,
                    location TEXT
                )
            `, (err) => {
                if (err) {
                    console.error('Erro ao criar tabela events:', err.message);
                }
            });
        });
    }
});

// Rota de login
app.post('/api/login', (req, res) => {
    console.log('POST /api/login chamado');
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
    }
    db.get(`SELECT * FROM profile WHERE email = ? AND password = ?`, [email, password], (err, row) => {
        if (err) {
            return res.status(500).json({ message: 'Erro ao buscar o perfil.', error: err.message });
        }
        if (!row) {
            return res.status(401).json({ message: 'Email ou senha incorretos.' });
        }
        res.json({ message: 'Login bem-sucedido.', profile: row });
    });
});

// Atualizar nome do perfil
app.put('/api/update_profile_name', (req, res) => {
    console.log('PUT /api/update_profile_name chamado');
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'Nome é obrigatório.' });
    }
    db.run(`UPDATE profile SET name = ? WHERE id = 1`, [name], function(err) {
        if (err) {
            return res.status(500).json({ message: 'Erro ao atualizar o nome.', error: err.message });
        }
        console.log('Nome do perfil atualizado para:', name);
        res.json({ message: 'Nome atualizado com sucesso.' });
    });
});

// Atualizar biografia
app.put('/api/update_bio', (req, res) => {
    console.log('PUT /api/update_bio chamado');
    const { bio } = req.body;
    if (!bio) {
        return res.status(400).json({ message: 'Biografia é obrigatória.' });
    }
    db.run(`UPDATE profile SET bio = ? WHERE id = 1`, [bio], function(err) {
        if (err) {
            return res.status(500).json({ message: 'Erro ao atualizar a biografia.', error: err.message });
        }
        console.log('Biografia do perfil atualizada para:', bio);
        res.json({ message: 'Biografia atualizada com sucesso.' });
    });
});

// Adicionar citação
app.post('/api/add_quote', (req, res) => {
    console.log('POST /api/add_quote chamado');
    const { quote } = req.body;
    if (!quote) {
        return res.status(400).json({ message: 'Citação é obrigatória.' });
    }
    db.run(`INSERT INTO quotes (quote) VALUES (?)`, [quote], function(err) {
        if (err) {
            return res.status(500).json({ message: 'Erro ao adicionar a citação.', error: err.message });
        }
        console.log('Citação adicionada:', quote);
        res.json({ message: 'Citação adicionada com sucesso.', id: this.lastID });
    });
});

// Excluir citação
app.delete('/api/delete_quote', (req, res) => {
    console.log('DELETE /api/delete_quote chamado');
    const { id } = req.body;
    if (!id) {
        return res.status(400).json({ message: 'ID da citação é obrigatório.' });
    }
    db.run(`DELETE FROM quotes WHERE id = ?`, [id], function(err) {
        if (err) {
            return res.status(500).json({ message: 'Erro ao excluir a citação.', error: err.message });
        }
        console.log('Citação excluída, ID:', id);
        res.json({ message: 'Citação excluída com sucesso.' });
    });
});

// Adicionar evento
app.post('/api/add_event', (req, res) => {
    console.log('POST /api/add_event chamado');
    const { name, date, location } = req.body;
    if (!name || !date || !location) {
        return res.status(400).json({ message: 'Nome, data e local do evento são obrigatórios.' });
    }
    db.run(`INSERT INTO events (name, date, location) VALUES (?, ?, ?)`, [name, date, location], function(err) {
        if (err) {
            return res.status(500).json({ message: 'Erro ao adicionar o evento.', error: err.message });
        }
        console.log('Evento adicionado:', { name, date, location });
        res.json({ message: 'Evento adicionado com sucesso.', id: this.lastID });
    });
});

// Excluir evento
app.delete('/api/delete_event', (req, res) => {
    console.log('DELETE /api/delete_event chamado');
    const { id } = req.body;
    if (!id) {
        return res.status(400).json({ message: 'ID do evento é obrigatório.' });
    }
    db.run(`DELETE FROM events WHERE id = ?`, [id], function(err) {
        if (err) {
            return res.status(500).json({ message: 'Erro ao excluir o evento.', error: err.message });
        }
        console.log('Evento excluído, ID:', id);
        res.json({ message: 'Evento excluído com sucesso.' });
    });
});

// Buscar informações do perfil
app.get('/api/get_profile', (req, res) => {
    console.log('GET /api/get_profile chamado');
    db.get(`SELECT * FROM profile WHERE id = 1`, (err, row) => {
        if (err) {
            return res.status(500).json({ message: 'Erro ao buscar o perfil.', error: err.message });
        }
        res.json(row);
    });
});

// Buscar todas as citações
app.get('/api/get_quotes', (req, res) => {
    console.log('GET /api/get_quotes chamado');
    db.all(`SELECT * FROM quotes`, (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Erro ao buscar as citações.', error: err.message });
        }
        res.json(rows);
    });
});

// Buscar todos os eventos
app.get('/api/get_events', (req, res) => {
    console.log('GET /api/get_events chamado');
    db.all(`SELECT * FROM events`, (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Erro ao buscar os eventos.', error: err.message });
        }
        res.json(rows);
    });
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
