const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const path = require('path');
const { error } = require('console');
const session = require('express-session');

const app = express();
const port = 3000;

// Conexão com o banco de dados MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'VigiaEnchente'
});

// Conectar ao banco de dados
db.connect((err) => {
  if (err) throw err;
  console.log('Conectado ao banco de dados!');
});

// Middleware para fazer parsing do corpo das requisições
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname));

app.use(session({
  secret: 'segredo-super-seguro', // Chave secreta para assinar o cookie da sessão
  resave: false, // Não salva a sessão se nada foi modificado
  saveUninitialized: true, // Salva sessões não inicializadas
  cookie: { maxAge: 3600000 } // Tempo de expiração do cookie (1 hora)
}));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Rota para a página de login (login.html)
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

// Rota para login
app.post('/login', (req, res) => {
  const { email, senha } = req.body;

  // Verifica se o email existe
  db.query('SELECT * FROM Users WHERE email = ?', [email], (err, results) => {
    if (err){
      console.error('Erro ao autenticar:', err)
      return res.status(500).json({error: 'Erro interno do servidor.'})
    };

    if (results.length === 0) {
      return res.status(404).json({error: 'Usuário não encontrado'});
    }

    const user = results[0];
    
    // Verifica se a senha está correta
    bcrypt.compare(senha, user.senha, (err, result) => {
      if (err) throw err;

      if (result) {
        req.session.userId = user.id_user; // Armazena o ID do usuário na sessão
        req.session.userName = user.nome; // Armazena o nome do usuário
        req.session.userEmail = user.email; // Armazena o e-mail
        req.session.userPhone = user.phone;
        res.status(200).json({message: 'Login bem-sucedido'});
      } else {
        res.status(400).json('Senha incorreta');
      }
    });
  });
});

// Rota para cadastro
app.post('/cadastro', (req, res) => {
  const { nome, email, phone, senha } = req.body;

  if (!nome || !email || !phone || !senha) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  bcrypt.hash(senha, 10, (err, hashedPassword) => {
    if (err) {
      console.error('Erro ao gerar hash da senha:', err);
      return res.status(500).json({ error: 'Erro ao processar a senha.' });
    }

    const query = 'INSERT INTO Users (nome, email, phone, senha) VALUES (?, ?, ?, ?)';
    db.execute(query, [nome, email, phone, hashedPassword], (err, results) => {
      if (err) {
        console.error('Erro ao inserir no banco de dados:', err);
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ error: 'E-mail ou telefone já cadastrado.' });
        }
        return res.status(500).json({ error: 'Erro ao cadastrar o usuário.' });
      }

      res.status(201).json({ message: 'Usuário cadastrado com sucesso' });
    });
  });
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
