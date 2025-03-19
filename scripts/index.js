document.addEventListener('DOMContentLoaded', function() {
  // Primeiro, buscar os dados do usuário logado
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
  .then(userData => {
    // Verificar se o usuário tem endereço cadastrado
    if (!userData.endereco) {
      updateWeatherUI({
        error: true,
        message: 'Endereço não cadastrado'
      });
      return;
    }

    // Obter dados de localização do endereço do usuário
    const cidade = userData.endereco.cidade;
    const apiKey = '733da4642c26a47989b7d127dc1c9aac'; // Substitua pela sua chave da API OpenWeatherMap
    
    // Buscar dados climáticos para a cidade do usuário
    return fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cidade},br&units=metric&lang=pt_br&appid=${apiKey}`);
  })
  .then(response => {
    if (!response || !response.ok) {
      throw new Error('Falha ao obter dados climáticos');
    }
    return response.json();
  })
  .then(weatherData => {
    // Atualizar a UI com os dados do clima
    updateWeatherUI(weatherData);
  })
  .catch(error => {
    console.error('Erro:', error);
    updateWeatherUI({
      error: true,
      message: error.message
    });
  });

  // Função para atualizar a UI com os dados do clima
  function updateWeatherUI(data) {
    if (data.error) {
      // Exibir mensagem de erro
      document.querySelector('.weather-title').textContent = 'Erro';
      document.querySelector('.temp_value').textContent = '';
      document.querySelector('.temp_description').textContent = data.message;
      document.querySelector('.temp-img').src = 'images/error-icon.png';
      return;
    }

    // Atualizar o título com o nome da cidade
    document.querySelector('.weather-title').textContent = data.name;
    
    // Atualizar temperatura e descrição
    document.querySelector('.temp_value').textContent = `${Math.round(data.main.temp)}° C`;
    document.querySelector('.temp_description').textContent = data.weather[0].description;
    
    // Atualizar ícone
    const iconCode = data.weather[0].icon;
    document.querySelector('.temp-img').src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    
    // Atualizar informações adicionais
    document.querySelector('.temp_max').textContent = `${Math.round(data.main.temp_max)}° C`;
    document.querySelector('.temp_min').textContent = `${Math.round(data.main.temp_min)}° C`;
    document.querySelector('.humidity').textContent = `${data.main.humidity}%`;
    
    // Atualizar velocidade do vento (convertendo de m/s para km/h)
    const windSpeed = Math.round(data.wind.speed * 3.6);
    document.querySelector('.info:last-child .temp_max').textContent = `${windSpeed} km/h`;
  }
});
