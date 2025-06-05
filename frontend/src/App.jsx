import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [alunos, setAlunos] = useState([]);
  const [form, setForm] = useState({
    nome: '',
    email: '',
    curso: '',
    matricula: '',
    status: ''
  });

  // Buscar alunos ao iniciar
  useEffect(() => {
    fetch('http://localhost:3000/alunos')
      .then(res => res.json())
      .then(data => setAlunos(data))
      .catch(err => console.error('Erro ao buscar alunos:', err));
  }, []);

  // Atualizar formulário
  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Adicionar aluno
  const adicionarAluno = e => {
    e.preventDefault();
    fetch('http://localhost:3000/alunos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
      .then(res => res.json())
      .then(novo => {
        if (novo.id) {
          setAlunos([...alunos, novo]);
          setForm({ nome: '', email: '', curso: '', matricula: '', status: '' });
        } else {
          alert(novo.error || 'Erro ao adicionar aluno');
        }
      })
      .catch(err => console.error('Erro ao adicionar aluno:', err));
  };

  // Remover aluno
  const deletarAluno = id => {
    fetch(`http://localhost:3000/alunos/${id}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(() => setAlunos(alunos.filter(aluno => aluno.id !== id)))
      .catch(err => console.error('Erro ao deletar:', err));
  };

  return (
    <div className="container">
      <h1>Cadastro de Alunos</h1>

      <form onSubmit={adicionarAluno}>
        <input name="nome" value={form.nome} onChange={handleChange} placeholder="Nome" required />
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" required />
        <input name="curso" value={form.curso} onChange={handleChange} placeholder="Curso" />
        <input name="matricula" value={form.matricula} onChange={handleChange} placeholder="Matrícula" required />
        <input name="status" value={form.status} onChange={handleChange} placeholder="Status" required />
        <button type="submit">Adicionar</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Curso</th>
            <th>Matrícula</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {alunos.map(aluno => (
            <tr key={aluno.id}>
              <td>{aluno.nome}</td>
              <td>{aluno.email}</td>
              <td>{aluno.curso}</td>
              <td>{aluno.matricula}</td>
              <td>{aluno.status}</td>
              <td><button onClick={() => deletarAluno(aluno.id)} className='remover'>Excluir</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
