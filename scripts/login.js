document.addEventListener('DOMContentLoaded', function () {
    const box = document.querySelector('.box');
    const registerBtn = document.getElementById('register');
    const loginBtn = document.getElementById('login');
  
    registerBtn.addEventListener('click', () => {
        box.classList.add("active");
    });
  
    loginBtn.addEventListener('click', () => {
        box.classList.remove("active");
    });

    document.getElementById('login-form').addEventListener('submit', function(event) {
      event.preventDefault();
    
      const email = document.getElementById('login-email').value.trim();
      const senha = document.getElementById('login-password').value.trim();
    
      fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      })
        .then(response => {
          if (!response.ok) {
            return response.json().then(err => { throw new Error(err.error); });
          }
          return response.json();
        })
        .then(data => {
          alert(data.message); // Exibe mensagem de sucesso
          window.location.href = '/profile';// Redireciona para a página de perfil
        })
        .catch(error => {
          console.error('Erro:', error.message);
          alert(error.message);
        });
    });
  
    document.getElementById('cadastro-form').addEventListener('submit', function(event) {
      event.preventDefault();
      
      const nome = document.getElementById('cadastro-nome').value.trim();
      const email = document.getElementById('cadastro-email').value.trim();
      const phone = document.getElementById('cadastro-phone').value.trim();
      const senha = document.getElementById('cadastro-password').value.trim();
      
  
      fetch('http://localhost:3000/cadastro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nome, email, phone, senha })
      })
      .then(response => {
        if (!response.ok) {
          return response.json().then(err => { throw new Error(err.error); });
        }
        return response.json();
      })
      .then(data => {
        alert(data.message); // Exibe mensagem de sucesso
      })
      .catch(error => {
        console.error('Erro:', error.message);
        alert(error.message);
      });
    });

  });

  