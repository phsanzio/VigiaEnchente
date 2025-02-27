document.addEventListener('DOMContentLoaded', function () {
  fetch('http://localhost:3000/usuario', {
    method: 'GET',
    credentials: 'include' // Inclui cookies/sessão na requisição
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Usuário não autenticado.');
      }
      return response.json();
    })
    .then(data => {
      // Preenche os campos com os dados do usuário
      document.querySelector('.name-user').textContent = data.nome;
      document.querySelector('.email-user').textContent = `Email: ${data.email}`;
      document.querySelector('.phone-user').textContent = `Telefone: ${data.phone}`;
    })
    .catch(error => console.error('Erro:', error.message));

    document.getElementById('button-logout').addEventListener('click', function(event) {
      event.preventDefault(); // Previne comportamento padrão, caso seja usado em um formulário
    
      // Faz uma requisição POST para a rota /logout
      fetch('http://localhost:3000/logout', {
        method: 'POST',
        credentials: 'include', // Inclui cookies/sessão na requisição
        headers: { 'Content-Type': 'application/json' }
      })
        .then(response => {
          if (!response.ok) {
            return response.json().then(err => { throw new Error(err.error); });
          }
          return response.json();
        })
        .then(data => {
          alert(data.message); // Exibe mensagem de logout bem-sucedido
          window.location.href = '/login'; // Redireciona para a página de login
        })
        .catch(error => {
          console.error('Erro ao fazer logout:', error.message);
          alert('Erro ao fazer logout. Tente novamente.');
        });
    });

});
