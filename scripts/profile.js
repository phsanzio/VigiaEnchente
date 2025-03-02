document.addEventListener('DOMContentLoaded', function () {
    // Busca os dados do usuário autenticado
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

    // Logout
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
                window.location.href = '/profile'; // Redireciona para a página de login
            })
            .catch(error => {
                console.error('Erro ao fazer logout:', error.message);
                alert('Erro ao fazer logout. Tente novamente.');
            });
    });

    // Máscara do CEP
    $(document).ready(function () {
        $("#cep").mask("99999999");
    });

    // Uso da API dos Correios
    const cepInput = document.querySelector('#cep');
    if (cepInput) {
        cepInput.addEventListener("blur", (event) => {
            const cep = cepInput.value.replace(/\D/g, ''); // Remove caracteres não numéricos
            if (cep.length !== 8) {
                alert('CEP inválido. O CEP deve ter 8 dígitos.');
                return;
            }
            const url = `https://brasilapi.com.br/api/cep/v1/${cep}`;

            fetch(url)
                .then(resp => {
                    if (!resp.ok) {
                        throw new Error('CEP não encontrado ou erro na API.');
                    }
                    return resp.json();
                })
                .then(ret => {
                    let uf = document.querySelector('#uf');
                    let city = document.querySelector('#cidade');
                    let neighbor = document.querySelector('#bairro');
                    let street = document.querySelector('#endereco');
                    let num = document.querySelector('#nr_end');

                    if (uf) uf.value = ret.state || ''; // UF
                    if (city) city.value = ret.city || ''; // Cidade
                    if (neighbor) neighbor.value = ret.neighborhood || ''; // Bairro
                    if (street) street.value = ret.street || ''; // Rua
                    if (num) num.value = '';
                })
                .catch(error => {
                    console.error('Erro ao buscar CEP:', error);
                    alert('Erro ao buscar CEP. Verifique o CEP e tente novamente.');
                });
        });
    }

    // Vincula o botão "Salvar Alterações" à função saveInfosBD
    const saveButton = document.querySelector('.saveInfos');
    if (saveButton) {
        saveButton.addEventListener('click', saveInfosBD);
    }
});

// Função para salvar as informações de endereço no banco de dados
function saveInfosBD() {
    let cep = document.querySelector('#cep').value;
    let city = document.querySelector('#cidade').value;
    let neighbor = document.querySelector('#bairro').value;
    let street = document.querySelector('#endereco').value;
    let num = document.querySelector('#nr_end').value;

    const address = {
        street,
        num,
        cep,
        neighbor,
        city
    };

    fetch('http://localhost:3000/saveEndr', {
        method: 'POST',
        credentials: 'include', // Inclui cookies/sessão
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(address)
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.error);
                });
            }
            return response.json();
        })
        .then(data => {
            alert('Endereço salvo com sucesso!');
        })
        .catch(error => {
            console.error('Erro ao salvar endereço:', error.message);
            alert('Erro ao salvar endereço. Tente novamente.');
        });
}