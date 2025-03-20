document.addEventListener('DOMContentLoaded', function () {
  const apiKey = '733da4642c26a47989b7d127dc1c9aac'; 
  const cidadePadrao = "Salvador"; 
  const ipInfoToken = "d38fbda3ef6488"; 


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


  function buscarCidadePorIP() {
    fetch(`https://ipinfo.io/json?token=${ipInfoToken}`)
      .then(response => {
        if (!response.ok) throw new Error('Falha ao obter localização pelo IP');
        return response.json();
      })
      .then(data => {
        if (!data.city) throw new Error('Não foi possível determinar a localização pelo IP');
        console.log(`Cidade detectada pelo IP: ${data.city}`);
        buscarClima(data.city);
      })
      .catch(() => {
        console.log('Usando cidade padrão por falha na geolocalização.');
        buscarClima(cidadePadrao); 
      });
  }

 
  fetch('http://localhost:3000/usuario', {
    method: 'GET',
    credentials: 'include'
  })
    .then(response => {
      if (!response.ok) throw new Error('Usuário não autenticado');
      return response.json();
    })
    .then(userData => {
      const cidade = userData.endereco?.cidade;
      if (cidade) {
        buscarClima(cidade);
      } else {
        console.log('Usuário sem endereço cadastrado. Buscando cidade pelo IP...');
        buscarCidadePorIP();
      }
    })
    .catch(() => {
      console.log('Usuário não autenticado. Buscando cidade pelo IP...');
      buscarCidadePorIP();
    });

  
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

  const newsApiKey = "70be492766714d8cbf00ad8ada64f751"; // Sua chave da NewsAPI
  const newsContainer = document.querySelector(".news-container"); // Div onde será exibida a notícia

  function buscarNoticias() {
    const query = 'risco de enchente';  // Ajustando a consulta para ser mais específica sobre eventos climáticos
    // Fazendo a requisição para a API
    fetch(`https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=pt&apiKey=${newsApiKey}`)
      .then(response => {
        if (!response.ok) throw new Error("Erro ao buscar notícias");
        return response.json();
      })
      .then(data => {
        if (!data.articles.length) throw new Error("Nenhuma notícia encontrada");

        // Seleciona as duas notícias mais recentes
        const articles = data.articles.slice(0, 2); // Pega as duas primeiras notícias

        // Exibe as manchetes com o link "Leia mais"
        let headlines = '';
        articles.forEach(article => {
          headlines += `
            <p><strong>${article.title}</strong></p>
            <a href="${article.url}" target="_blank">Leia mais</a>
          `;
        });

        newsContainer.innerHTML = headlines;
      })
      .catch(error => {
        console.error("Erro ao buscar notícia:", error);
        newsContainer.innerHTML = "<p>Não foi possível carregar notícias.</p>";
      });
  }

  // Buscar notícias ao carregar a página
  buscarNoticias();


});
