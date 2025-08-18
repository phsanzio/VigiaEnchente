const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const path = require('path');
const { error } = require('console');
const cors = require('cors');
const webpush = require('web-push');
require('dotenv').config();

const isTest = process.env.NODE_ENV === 'test';

const app = express();
const corsOptions = {
  origin: true, // Permite todas as origens
  credentials: true // Permite cookies/sessão
};
app.use(cors(corsOptions));
const port = 3000;

// Conexão com o banco de dados MySQL
let db;
if (isTest) {
  // lightweight fake DB for tests (callbacks compatible)
  db = {
    connect: (cb) => cb && cb(null),
    execute: (q, params, cb) => cb && cb(null, []),
    query: (q, params, cb) => cb && cb(null, [])
  };
} else {
  const mysql = require('mysql2');
  db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: process.env.DATABASE_PASSWORD,
    database: 'VigiaEnchente'
  });
}

// Conectar ao banco de dados
db.connect((err) => {
  if (err) {
    if (!isTest) throw err;
    console.warn('DB connect skipped in test mode:', err);
  } else {
    console.log('Conectado ao banco de dados!');
  }
});

// Middleware para fazer parsing do corpo das requisições
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname));

const sessionStoreOptions = {}; // optional: leave empty to use defaults
let sessionStore;
if (isTest) {
  // use built-in memory store in tests to avoid MySQL session store dependency
  const MemoryStore = session.MemoryStore;
  sessionStore = new MemoryStore();
} else {
  const MySQLStore = require('express-mysql-session')(session);
  sessionStore = new MySQLStore(sessionStoreOptions, db);
}

app.use(session({
  key: 'connect.sid',
  store: sessionStore,
  secret: 'segredo-super-seguro',
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: { maxAge: 7*24*60*60*1000, httpOnly: true, secure: false, sameSite: 'lax' }
}));

//mandar notificações pelo navegador

// VAPID keys: don't abort server on missing keys (tests won't set them)
const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY;

if (!publicVapidKey || !privateVapidKey) {
  console.error('Missing VAPID keys - continuing without webpush VAPID setup');
} else {
  webpush.setVapidDetails(
    'mailto:'+process.env.EMAIL,
    publicVapidKey,
    privateVapidKey
  );
}

app.post("/subscribe", (req, res) => {
  //console.log('Incoming /subscribe body:', JSON.stringify(req.body)); // <--- debug
  console.log('Headers:', JSON.stringify(req.headers));
  console.log('Raw body:', JSON.stringify(req.body)); // what the client actually posted
  let subscription = req.body && req.body.subscription ? req.body.subscription : req.body;
  const payloadObj = req.body && req.body.payload ? req.body.payload : { title: "VigiaEnchente", body: "Notif. padrao" };
  console.log('Resolved subscription:', !!subscription && subscription.endpoint ? subscription.endpoint : '<none>');
  console.log('Resolved payloadObj:', JSON.stringify(payloadObj)); // <--- debug
  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ error: 'Invalid subscription' });
  }

  // persist subscription in DB
  const endpoint = subscription.endpoint;
  const p256dh = subscription.keys?.p256dh || null;
  const auth = subscription.keys?.auth || null;
  const payloadJson = JSON.stringify(payloadObj);
  const userId = req.session?.userId || null;

  const upsertQuery = `
    INSERT INTO Subscriptions (endpoint, p256dh, auth, user_id, payload)
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE p256dh = VALUES(p256dh), auth = VALUES(auth), user_id = VALUES(user_id), payload = VALUES(payload), updated_at = CURRENT_TIMESTAMP
  `;

  db.execute(upsertQuery, [endpoint, p256dh, auth, userId, payloadJson], (err) => {
    if (err) {
      console.error('Erro ao persistir subscription:', err);
      return res.status(500).json({ error: 'Erro ao salvar subscription' });
    }

    // optionally send an immediate test notification here, or simply acknowledge
    return res.status(201).json({ success: true, saved: true });
  });

  /* payload must be a string
  const payload = JSON.stringify(payloadObj);

  webpush.sendNotification(subscription, payload)
    .then(response => {
      console.log('Push enviado:', response);
      return res.status(201).json({ success: true });
    })
    .catch(err => {
      console.error('Erro ao enviar push:', err);
      return res.status(500).json({ error: 'Falha ao enviar push' });
    });
  */
});

//mandar notificações pelo navegador
// Helper: send notification to one subscription object
async function sendNotificationTo(subscriptionRow) {
  const sub = {
    endpoint: subscriptionRow.endpoint,
    keys: {
      p256dh: subscriptionRow.p256dh,
      auth: subscriptionRow.auth
    }
  };

  // Ensure payload is a string (web-push requires string or Buffer)
  let payload;
  if (subscriptionRow.payload == null) {
    payload = JSON.stringify({ title: 'VigiaEnchente', body: 'Alerta padrão' });
  } else if (typeof subscriptionRow.payload === 'string') {
    payload = subscriptionRow.payload;
  } else {
    try {
      payload = JSON.stringify(subscriptionRow.payload);
    } catch (e) {
      console.error('Failed to stringify payload, using default:', e);
      payload = JSON.stringify({ title: 'VigiaEnchente', body: 'Alerta padrão' });
    }
  }
  
  try {
    await webpush.sendNotification(sub, payload);
    console.log(`Notif. enviada para:\n ${JSON.stringify(sub)}`)
    return true;
  } catch (err) {
    // If unsubscribed/expired, remove it from DB
    const status = err && err.statusCode ? err.statusCode : null;
    console.error('sendNotification error for', subscriptionRow.endpoint, err);
    if (status === 410 || status === 404) {
      db.execute('DELETE FROM Subscriptions WHERE endpoint = ?', [subscriptionRow.endpoint], (delErr) => {
        if (delErr) console.error('Erro ao remover subscription inválida:', delErr);
      });
    }
    return false;
  }
}

// Periodic job: fetch all subscriptions and send payloads every 5 minutes
async function periodicPushWorker() {
  db.execute('SELECT endpoint, p256dh, auth, payload, user_id FROM Subscriptions', [], async (err, rows) => {
    if (err) {
      console.error('Erro ao buscar subscriptions:', err);
      return;
    }
    for (const r of rows) {
      // Optionally build a custom payload per user: query Address by r.user_id and call flood API
      // For now use stored payload or default
      await sendNotificationTo(r);
    }
  });
}

// start periodic job every 5 minutes (300000ms)
// setInterval(periodicPushWorker, 60 * 1000);

// you may also trigger an immediate run on startup
// periodicPushWorker();

if (!isTest) {
  // only start periodic worker in non-test runs to avoid keeping the process alive in tests
  setInterval(periodicPushWorker, 60 * 1000);
  periodicPushWorker();
}

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

      //sendConfirmationMessage(nome, email);

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


// Iniciar o servidor only when run directly and not under tests
if (!isTest && require.main === module) {
  app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
  });
}

// Export app and db for tests
module.exports = { app, db };
