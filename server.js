const express = require('express');
const session = require('express-session');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const path = require('path');
const { error } = require('console');
const cors = require('cors');
const { sendConfirmationMessage } = require('./scripts/emailService.js');
const PushNotifications = require('node-pushnotifications');
require('dotenv').config();

const app = express();
const corsOptions = {
  origin: true, // Permite todas as origens
  credentials: true // Permite cookies/sessão
};
app.use(cors(corsOptions));
const port = 3000;

// Conexão com o banco de dados MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: process.env.DATABASE_PASSWORD,
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
  cookie: { maxAge: 3600000 },
  secure: false,
  httpOnly: true,
  sameSite: 'strict' 
}));

//mandar notificações pelo navegador

const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY;

app.post("/subscribe", (req, res) => {
  const subscription = req.body;
  const settings = {
    web: {
      vapidDetails: {
        subject: process.env.EMAIL,
        publicKey: publicVapidKey,
        privateKey: privateVapidKey,
      },
      gcmAPIKey: "gcmkey",
      TTL: 2419200,
      contentEncoding: "aes128gcm",
      headers: {},
    },
    isAlwaysUseFCM: false,
  };

  const push = new PushNotifications(settings);

  const payload = { title: "VigiaEnchente"};
  push.send(subscription, payload, (err, result) => {
    if(err){
      console.log(err);
    }else{
      console.log(result);
    }
  });
});
//mandar notificações pelo navegador

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Rota para a página de login (login.html)
app.get('/login', (req, res) => {
  if (req.session.userId) {
    // Redireciona para a página de perfil se o usuário já estiver autenticado
    return res.redirect('/profile');
  }

  // Envia a página login.html se o usuário não estiver autenticado
  res.sendFile(path.join(__dirname, 'login.html'));
});


app.get('/profile', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  res.sendFile(path.join(__dirname, 'profile.html'));
});


// Rota para login
app.post('/login', (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
  }

  db.query('SELECT * FROM Users WHERE email = ?', [email], (err, results) => {
    if (err) {
      console.error('Erro ao autenticar:', err);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const user = results[0];

    bcrypt.compare(senha, user.senha, (err, result) => {
      if (err) {
        console.error('Erro ao comparar senhas:', err);
        return res.status(500).json({ error: 'Erro interno ao verificar a senha.' });
      }

      if (result) {
        req.session.userId = user.id_user;
        req.session.userName = user.nome;
        req.session.userEmail = user.email;
        req.session.userPhone = user.phone;

        res.status(200).json({ message: 'Login bem-sucedido' });
      } else {
        res.status(400).json({ error: 'Senha incorreta' });
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

      sendConfirmationMessage(nome, email);

      res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
    });
  });
});

app.get('/usuario', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Usuário não autenticado.' });
  }

  // Query para buscar dados do usuário
  const userQuery = 'SELECT nome, email, phone FROM Users WHERE id_user = ?';
  
  db.execute(userQuery, [req.session.userId], (err, userResults) => {
    if (err) {
      console.error('Erro ao buscar dados do usuário:', err);
      return res.status(500).json({ error: 'Erro ao buscar dados do usuário.' });
    }

    if (userResults.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    // Buscar o endereço do usuário
    const addressQuery = 'SELECT rua, num_rua, cep, bairro, cidade FROM Address WHERE id_address_user = ?';
    
    db.execute(addressQuery, [req.session.userId], (err, addressResults) => {
      if (err) {
        console.error('Erro ao buscar endereço do usuário:', err);
        // Mesmo com erro no endereço, retornamos os dados básicos do usuário
        return res.json(userResults[0]);
      }

      // Combinamos os resultados
      const userData = userResults[0];
      
      // Se o usuário tiver um endereço cadastrado
      if (addressResults.length > 0) {
        userData.endereco = addressResults[0];
      } else {
        userData.endereco = null;
      }

      res.json(userData);
    });
  });
});


app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao encerrar a sessão.' });
    }
    res.clearCookie('connect.sid'); // Limpa o cookie da sessão no navegador
    res.json({ message: 'Logout bem-sucedido!' });
  });
});

//Rota para salvar as informaçoes de endereço do usuário
app.post('/saveEndr', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Usuário não autenticado.' });
  }

  const { street, num, cep, neighbor, city } = req.body;
  const userId = req.session.userId;

  // Primeiro verificamos se o usuário já tem um endereço cadastrado
  const checkQuery = 'SELECT id_address FROM Address WHERE id_address_user = ?';
  
  db.execute(checkQuery, [userId], (err, results) => {
    if (err) {
      console.error('Erro ao verificar endereço existente:', err);
      return res.status(500).json({ error: 'Erro ao verificar endereço existente.' });
    }

    if (results.length > 0) {
      // Atualiza o endereço existente
      const updateQuery = 'UPDATE Address SET rua = ?, num_rua = ?, cep = ?, bairro = ?, cidade = ? WHERE id_address_user = ?';
      
      db.execute(updateQuery, [street, num, cep, neighbor, city, userId], (err, updateResults) => {
        if (err) {
          console.error('Erro ao atualizar endereço:', err);
          return res.status(500).json({ error: 'Erro ao atualizar endereço.' });
        }
        
        return res.status(200).json({ message: 'Endereço atualizado com sucesso' });
      });
    } else {
      // Insere um novo endereço
      const insertQuery = 'INSERT INTO Address (id_address_user, rua, num_rua, cep, bairro, cidade) VALUES (?, ?, ?, ?, ?, ?)';
      
      db.execute(insertQuery, [userId, street, num, cep, neighbor, city], (err, insertResults) => {
        if (err) {
          console.error('Erro ao inserir endereço:', err);
          return res.status(500).json({ error: 'Erro ao salvar endereço.' });
        }
        
        return res.status(201).json({ message: 'Endereço salvo com sucesso' });
      });
    }
  });
});


// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
