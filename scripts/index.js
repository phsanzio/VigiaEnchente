document.addEventListener('DOMContentLoaded', function () {
  const apiKey = '733da4642c26a47989b7d127dc1c9aac'; 
  const cidadePadrao = "Sabará"; 
  const ipInfoToken = "d38fbda3ef6488";
  //const publicVapidKey = process.env.PUBLIC_VAPID_KEY; //index.js nao consegue pegar variavel do .env, põe a string hardcoded msm q roda :)


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

  const newsApiKey = "70be492766714d8cbf00ad8ada64f751"; // chave da NewsAPI
  const newsContainer = document.querySelector(".news-container"); // Div onde será exibida a notícia

  function buscarNoticias() {
    const query = 'risco de enchente';
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

function formatarDataAtual() {
  const dataAtual = new Date();
  const ano = dataAtual.getFullYear();
  const mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
  const dia = String(dataAtual.getDate()).padStart(2, '0');
  let datas = [];
  let dia0 = dia-2;
  datas[0] = `${ano}-${mes}-${dia0}`; //2 dias atrás
  datas[1] = `${ano}-${mes}-${dia}`; //dia atual
  datas.forEach(data => {
    console.log(data);
  })
  return datas;
}


document.addEventListener('DOMContentLoaded', async function () {
  async function fetchFloodData() {
    dataInicio = formatarDataAtual()[0];
    dataFim = formatarDataAtual()[1];
    const url = "https://flood-api.open-meteo.com/v1/flood";
    const params = new URLSearchParams({
        latitude: 59.9,
        longitude: 10.75,
        daily: "river_discharge",
        models: "forecast_v4",
        start_date: dataInicio,
        end_date: dataFim
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

  const publicVapidKey = 'BCQisdcMW1TRQT8VTGVM8Ds-hYNGOsNhsynqCBeDKrt-BJmKvy6iYrGkSgQoamQHp6xdFJY0zhzq4wMsGUIp7QY';

  // Check for service worker
  if ("serviceWorker" in navigator) {
    send().catch((err) => console.error(err));
  }
  
  // Register SW, Register Push, Send Push
  async function send() {
    // Register Service Worker
    console.log("Registering service worker...");
    const register = await navigator.serviceWorker.register("./sw.js", {
      scope: "/",
    });
    console.log("Service Worker Registered...");
  
    // Register Push
    console.log("Registering Push...");
    const subscription = await register.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
    });
    console.log("Push Registered...");
  
    // Send Push Notification
    console.log("Sending Push...");

    let estado = await isFlood();

    const payload = {
      title: 'VigiaEnchente',
      body: `Sabará: risco ` + estado
      // other fields go here
    };

    await fetch("http://localhost:3000/subscribe", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription, payload })
    });
    console.log("Push Sent...");
  }
  
  function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, "+")
      .replace(/_/g, "/");
  
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
  
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
});

