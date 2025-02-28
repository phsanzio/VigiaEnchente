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
      
      const forms_login = document.getElementById('login-form');
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
          forms_login.reset();
          window.location.href = '/profile';// Redireciona para a página de perfil
        })
        .catch(error => {
          console.error('Erro:', error.message);
          alert(error.message);
        });
    });

    $("#cadastro-phone").mask("(00) 00000-0000");

    document.getElementById('cadastro-form').addEventListener('submit', function(event) {
      event.preventDefault();
      
      const forms_cadastro = document.getElementById('cadastro-form');
      const nome = document.getElementById('cadastro-nome').value.trim();
      const email = document.getElementById('cadastro-email').value.trim();
      const phone = document.getElementById('cadastro-phone').value.trim();
      const senha = document.getElementById('cadastro-password').value.trim();
      const confirm = document.getElementById('confirm-password').value.trim();
      const terms_confirm = document.getElementById('terms_confirm');
      
      if (confirm == senha){
        let telefone = phone.replace(/\D/g, '');
        if (telefone.length === 11) {
          if (terms_confirm.checked){
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
              forms_cadastro.reset();
            })
            .catch(error => {
              console.error('Erro:', error.message);
              alert(error.message);
            });
          } else {
            alert('Aceite os termos de serviço, por favor.');
          }
        } else{
          alert('Telefone inválido!');
        }
      } else {
        alert('Senhas não coincidem!');
      }
    })
  });

  