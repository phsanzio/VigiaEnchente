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

// function getData() {
//   const start_date = new Date();
//   console.log(dataAtual);
//   const dataAtual = new Date();
//   const dia = String(dataAtual.getDate()).padStart(2, '0');
//   const mes = String(dataAtual.getMonth() + 1).padStart(2, '0'); // Janeiro é 0!
//   const ano = dataAtual.getFullYear();

//   const dataFormatada = ${dia}/${mes}/${ano};
//   console.log(dataFormatada); // Exemplo de saída: 20/03/2025
// }


document.addEventListener('DOMContentLoaded', async function () {
      async function fetchFloodData() {
        const url = "https://flood-api.open-meteo.com/v1/flood";
        const params = new URLSearchParams({
            latitude: 59.9,
            longitude: 10.75,
            daily: "river_discharge",
            models: "forecast_v4",
            start_date: "2025-03-18",
            end_date: "2025-03-20"
        });
    
        try {
            const response = await fetch(`${url}?${params}`);
            if (!response.ok) throw new Error(`Erro na requisição: ${response.status}`);
            
            const data = await response.json();
            let dados = await processFloodData(data);
            if(dados != null){
                return dados;
            }
        } catch (error) {
            console.error("Erro ao buscar dados de inundação:", error);
        }
      }
  
  function processFloodData(data) {
    if (!data || !data.daily) {
      console.log("Nenhum dado disponível.");
      return;
    }

    console.log(`Coordenadas: ${data.latitude}°N, ${data.longitude}°E`);
    console.log(`Fuso Horário: ${data.timezone} (${data.timezone_abbreviation})`);
    console.log(`Diferença para GMT+0: ${data.utc_offset_seconds} s`);
    console.log(`Unidade de Medida: ${data.daily_units.river_discharge}`);
    
    const dates = data.daily.time;
    const riverDischarge = data.daily.river_discharge;
    
    let dados = []; 
    console.log("Dados de descarga do rio:");
    dates.forEach((date, index) => {
        console.log(`${date}: ${riverDischarge[index]} m³/s`);
        dados.push(riverDischarge[index]);
    });
    return dados;
}

async function isFlood(){
  const estados = ['baixo', 'medio', 'alto'];
  let dadosRio = [];
  dadosRio = await fetchFloodData();

  let estado = null;
  let mediaElevacaoRio = 0;
  let variacaoElevacaoRio = 0;

  if(dadosRio.length != 0){
    let soma = 0;
    soma = dadosRio[0] + dadosRio[1] + dadosRio[2];
    mediaElevacaoRio = (soma/3).toFixed(2);
    console.log(mediaElevacaoRio);
  }

  if(dadosRio.length != 0){
    let variacao = 0;
    variacao = (dadosRio[2] - dadosRio[0]).toFixed(2);
    variacaoElevacaoRio = variacao;
    console.log(variacaoElevacaoRio);
  }

  if(mediaElevacaoRio<5){
      if(variacaoElevacaoRio>3){
        estado = estados[1];
      }else if(variacaoElevacaoRio<-3){
        estado = estados[0];
      }else{
        estado = estados[0];
      }
  }else if(mediaElevacaoRio<10){
      if(variacaoElevacaoRio>3){
        estado = estados[2];
      }else if(variacaoElevacaoRio<-3){
        estado = estados[1];
      }else{
        estado = estados[1];
      }
  }else{
    estado = estados[2];//alto
  }
  
  return estado;
}

  async function updateAlert(){
    let estado = await isFlood();
    if(estado == 'baixo'){
      document.getElementById("alert").textContent = "Não há risco de enchente";
      document.getElementById('shield').src = 'images/shield_green.png';
      var alertElement = document.querySelector('.alert');
      alertElement.style.backgroundColor = 'rgba(0, 87, 6, 0.2)';
    }else if(estado == 'medio'){
      document.getElementById("alert").textContent = "Risco médio de enchente";
      document.getElementById('shield').src = 'images/shield_yellow.png';
      var alertElement = document.querySelector('.alert');
      alertElement.style.backgroundColor = 'rgba(87, 78, 0, 0.2)';
    }else{
      document.getElementById("alert").textContent = "Risco alto de enchente";
      document.getElementById('shield').src = 'images/shield_red.png';
      var alertElement = document.querySelector('.alert');
      alertElement.style.backgroundColor = 'rgba(87, 20, 0, 0.2)';
    }
  }

  await updateAlert();
});