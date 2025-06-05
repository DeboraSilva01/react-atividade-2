const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Conexão com banco SQLite
const db = new sqlite3.Database('./banco.db', (err) => {
  if (err) {
    console.error("Erro ao conectar:", err.message);
  } else {
    console.log("Conectado ao SQLite.");
   db.run(`CREATE TABLE IF NOT EXISTS Alunos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  curso TEXT,
  matricula TEXT NOT NULL,
  status TEXT NOT NULL
)`, (err) => {  
      if (err) {
        console.error("Erro ao criar tabela:", err.message);
      } else {
        console.log("Tabela Alunos criada ou já existe.");
      }
    });
  }
});

// [GET] Listar alunos
app.get('/alunos', (req, res) => {
  db.all('SELECT * FROM Alunos ORDER BY nome', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// [POST] Adicionar aluno
app.post('/alunos', (req, res) => {
  const { nome, email, curso, matricula, status } = req.body;

  if (!nome || !email || !matricula || !status) {
    return res.status(400).json({ error: 'Nome, email, matrícula e status são obrigatórios.' });
  }

  const sql = `INSERT INTO Alunos (nome, email, curso, matricula, status) VALUES (?, ?, ?, ?, ?)`;
  db.run(sql, [nome, email, curso, matricula, status], function (err) {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        return res.status(400).json({ error: 'Este email já está cadastrado.' });
      }
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID, nome, email, curso, matricula, status });
  });
});

// [DELETE] Remover aluno
app.delete('/alunos/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM Alunos WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Aluno não encontrado.' });
    res.json({ message: 'Aluno removido com sucesso!' });
  });
});

// [PUT] Atualizar aluno
app.put('/alunos/:id', (req, res) => {
  const { id } = req.params;
  const { nome, email, curso, matricula, status } = req.body;

  const campos = [];
  const valores = [];

  if (nome) { campos.push('nome = ?'); valores.push(nome); }
  if (email) { campos.push('email = ?'); valores.push(email); }
  if (curso) { campos.push('curso = ?'); valores.push(curso); }
  if (matricula) { campos.push('matricula = ?'); valores.push(matricula); }
  if (status) { campos.push('status = ?'); valores.push(status); }

  if (campos.length === 0) return res.status(400).json({ error: 'Nenhum dado fornecido para atualização.' });

  valores.push(id);
  const sql = `UPDATE Alunos SET ${campos.join(', ')} WHERE id = ?`;

  db.run(sql, valores, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Aluno não encontrado.' });
    res.json({ message: 'Aluno atualizado com sucesso.' });
  });
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
