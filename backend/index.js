// Importa os módulos necessários
const express = require('express');           // Framework web para Node.js
const cors = require('cors');                 // Middleware para permitir requisições de outros domínios (CORS)
const sqlite3 = require('sqlite3').verbose(); // Módulo do SQLite, com modo verboso para mensagens mais detalhadas

const app = express();                        // Cria a aplicação Express
const port = process.env.PORT || 3000;        // Define a porta do servidor (padrão: 3000)

// === Middlewares ===
app.use(cors());              // Permite que a API seja acessada por outras origens (CORS)
app.use(express.json());      // Permite receber JSON no corpo das requisições


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

// === [GET] Listar todos os alunos ===
app.get('/alunos', (req, res) => {
  db.all('SELECT * FROM Alunos ORDER BY nome', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message }); // Erro no banco
    res.json(rows); // Retorna a lista de alunos
  });
});


// === [POST] Adicionar novo aluno ===
app.post('/alunos', (req, res) => {
  const { nome, email, curso, matricula, status } = req.body;

  // Verifica se campos obrigatórios foram preenchidos
  if (!nome || !email || !matricula || !status) {
    return res.status(400).json({ error: 'Nome, email, matrícula e status são obrigatórios.' });
  }

  const sql = `INSERT INTO Alunos (nome, email, curso, matricula, status) VALUES (?, ?, ?, ?, ?)`;
  db.run(sql, [nome, email, curso, matricula, status], function (err) {
    if (err) {
      // Verifica erro de e-mail duplicado (único)
      if (err.message.includes('UNIQUE')) {
        return res.status(400).json({ error: 'Este email já está cadastrado.' });
      }
      return res.status(500).json({ error: err.message }); // Outro erro
    }
    // Retorna o aluno criado com o novo ID
    res.status(201).json({ id: this.lastID, nome, email, curso, matricula, status });
  });
});


// === [DELETE] Remover aluno por ID ===
app.delete('/alunos/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM Alunos WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message }); // Erro na exclusão
    if (this.changes === 0) return res.status(404).json({ error: 'Aluno não encontrado.' }); // ID inexistente
    res.json({ message: 'Aluno removido com sucesso!' }); // Sucesso
  });
});


// === [PUT] Atualizar dados do aluno ===
app.put('/alunos/:id', (req, res) => {
  const { id } = req.params;
  const { nome, email, curso, matricula, status } = req.body;

  const campos = [];  // Lista de campos a atualizar
  const valores = []; // Valores correspondentes

  // Adiciona os campos que foram enviados
  if (nome) { campos.push('nome = ?'); valores.push(nome); }
  if (email) { campos.push('email = ?'); valores.push(email); }
  if (curso) { campos.push('curso = ?'); valores.push(curso); }
  if (matricula) { campos.push('matricula = ?'); valores.push(matricula); }
  if (status) { campos.push('status = ?'); valores.push(status); }

  // Se nenhum campo foi enviado
  if (campos.length === 0) return res.status(400).json({ error: 'Nenhum dado fornecido para atualização.' });

  valores.push(id); // Adiciona o ID no final da lista de valores
  const sql = `UPDATE Alunos SET ${campos.join(', ')} WHERE id = ?`;

  db.run(sql, valores, function (err) {
    if (err) return res.status(500).json({ error: err.message }); // Erro no SQL
    if (this.changes === 0) return res.status(404).json({ error: 'Aluno não encontrado.' }); // Nenhum aluno alterado
    res.json({ message: 'Aluno atualizado com sucesso.' }); // Sucesso
  });
});


// === Inicia o servidor na porta configurada ===
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});