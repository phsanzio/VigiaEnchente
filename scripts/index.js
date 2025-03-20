document.addEventListener('DOMContentLoaded', function () {
  const apiKey = '733da4642c26a47989b7d127dc1c9aac'; // Substitua pela sua chave da API OpenWeatherMap
  const cidades = ["São Paulo", "Rio de Janeiro", "Belo Horizonte", "Salvador", "Fortaleza", "Curitiba", "Manaus", "Recife", "Porto Alegre", "Brasília"];

  // Função para escolher uma cidade aleatória
  function cidadeAleatoria() {
    return cidades[Math.floor(Math.random() * cidades.length)];
  }

  // Função para buscar o clima
  function buscarClima(cidade) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cidade},br&units=metric&lang=pt_br&appid=${apiKey}`)
      .then(response => {
        if (!response.ok) throw new Error('Falha ao obter dados climáticos');
        return response.json();
      })
      .then(updateWeatherUI)
      .catch(error => {
        console.error('Erro ao buscar clima:', error);
        updateWeatherUI({ error: true, message: 'Não foi possível obter o clima' });
      });
  }

  // Buscar os dados do usuário logado
  fetch('http://localhost:3000/usuario', {
    method: 'GET',
    credentials: 'include'
  })
    .then(response => {
      if (!response.ok) throw new Error('Usuário não autenticado');
      return response.json();
    })
    .then(userData => {
      const cidade = userData.endereco?.cidade || cidadeAleatoria();
      buscarClima(cidade);
    })
    .catch(() => {
      console.log('Usuário não autenticado ou sem endereço. Exibindo clima de uma cidade aleatória.');
      buscarClima(cidadeAleatoria());
    });

  // Função para atualizar a UI com os dados do clima
  function updateWeatherUI(data) {
    if (data.error) {
      document.querySelector('.weather-title').textContent = 'Erro';
      document.querySelector('.temp_value').textContent = '';
      document.querySelector('.temp_description').textContent = data.message;
      document.querySelector('.temp-img').src = 'images/error-icon.png';
      return;
    }

    document.querySelector('.weather-title').textContent = data.name;
    document.querySelector('.temp_value').textContent = `${Math.round(data.main.temp)}° C`;
    document.querySelector('.temp_description').textContent = data.weather[0].description;

    const iconCode = data.weather[0].icon;
    document.querySelector('.temp-img').src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

    document.querySelector('.temp_max').textContent = `${Math.round(data.main.temp_max)}° C`;
    document.querySelector('.temp_min').textContent = `${Math.round(data.main.temp_min)}° C`;
    document.querySelector('.humidity').textContent = `${data.main.humidity}%`;

    const windSpeed = Math.round(data.wind.speed * 3.6);
    document.querySelector('.info:last-child .temp_max').textContent = `${windSpeed} km/h`;
  }
});
