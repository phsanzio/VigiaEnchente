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
      
      const email = document.getElementById('login-email').value;
      const senha = document.getElementById('login-password').value;
    
      fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, senha })
      })
      .then(response => response.json())
      .then(data => alert(data))
      .catch(error => console.error('Erro:', error));
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
      .then(response => response.json())
      .then(data => alert(data))
      .catch(error => console.error('Erro:', error));
    });

  });

  