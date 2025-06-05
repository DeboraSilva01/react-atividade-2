import React, { useState, useEffect } from 'react';
import './App.css'; // importa o estilo CSS do app.js

//função principal que chamar e iniciar todo o front
function App() {
  const [alunos, setAlunos] = useState([]); // Lista de alunos já cadastrados e se não houver iniciar vazio
  const [form, setForm] = useState({  // Pegar os campos digitados pelo usuário no formulário para cadastrar novo aluno e iniciar ele como vazio
    nome: '',
    email: '',
    curso: '',
    matricula: '',
    status: ''
  });

  // Buscar alunos ao iniciar
  useEffect(() => {
    fetch('http://localhost:3000/alunos') //Faz uma requisição HTTP GET para o backend, buscando a lista de alunos.
      .then(res => res.json()) // Converte a resposta da requisição para JSON
      .then(data => setAlunos(data)) // atualiza o estado alunos, que será usado para renderizar a tabela/lista de alunos no frontend.
      .catch(err => console.error('Erro ao buscar alunos:', err)); //Caso a requisição falhe, mostra o erro no console.
  }, []);

  // Atualizar formulário
  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Adicionar aluno
  const adicionarAluno = e => {
    e.preventDefault();
    fetch('http://localhost:3000/alunos', { //Faz uma requisição Post e enviar os dados para backend em formato JSON
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
      .then(res => res.json())// Converte a resposta da API para um objeto JavaScript
      .then(novo => { //verificar se o aluno foi adicionado com sucesso e limpa os compos
        if (novo.id) {
          setAlunos([...alunos, novo]);
          setForm({ nome: '', email: '', curso: '', matricula: '', status: '' });
        } else { 
          alert(novo.error || 'Erro ao adicionar aluno');
        }
      })
      //Se ocorrer um erro na requisição
      .catch(err => console.error('Erro ao adicionar aluno:', err));
  };

  // Função para deletar um aluno pelo id
  const deletarAluno = id => {
    fetch(`http://localhost:3000/alunos/${id}`, { method: 'DELETE' }) // Requisição DELETE para backend
      .then(res => res.json()) // Converte resposta para JSON
      .then(() => 
        setAlunos(alunos.filter(aluno => aluno.id !== id)) // Atualiza lista removendo o aluno deletado
      )
      .catch(err => console.error('Erro ao deletar:', err));
  };

  // JSX retornado pelo componente para renderizar a interface
  return (
    <div className="container">
      <h1>Cadastro de Alunos</h1>

      {/* Formulário para adicionar aluno */}
      <form onSubmit={adicionarAluno}>
        <input
          name="nome"
          value={form.nome}
          onChange={handleChange}
          placeholder="Nome"
          required
        />
        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          required
        />
        <input
          name="curso"
          value={form.curso}
          onChange={handleChange}
          placeholder="Curso"
        />
        <input
          name="matricula"
          value={form.matricula}
          onChange={handleChange}
          placeholder="Matrícula"
          required
        />
        <input
          name="status"
          value={form.status}
          onChange={handleChange}
          placeholder="Status"
          required
        />
        <button type="submit">Adicionar</button> 
      </form>

      {/* Tabela exibindo a lista de alunos */}
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
              <td>
                <button onClick={() => deletarAluno(aluno.id)} className="remover">
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
