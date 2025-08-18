const apiKey = '733da4642c26a47989b7d127dc1c9aac';
const cidadePadrao = "Sabará";
const ipInfoToken = "d38fbda3ef6488";
const newsApiKey = "70be492766714d8cbf00ad8ada64f751";
const publicVapidKey = 'BCQisdcMW1TRQT8VTGVM8Ds-hYNGOsNhsynqCBeDKrt-BJmKvy6iYrGkSgQoamQHp6xdFJY0zhzq4wMsGUIp7QY';

// --- Helpers (module scope) ---
async function buscarClima(cidade) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cidade)},br&units=metric&lang=pt_br&appid=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Falha ao obter dados climáticos');
  return res.json();
}

async function buscarCoord(cidade) {
  const url = `http://api.openweathermap.org/geo/1.0/direct?q=${cidade}&limit=1&appid=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Falha ao obter coordenadas por cidade.');
  return res.json();
}

async function buscarCidadePorIP() {
  const res = await fetch(`https://ipinfo.io/json?token=${ipInfoToken}`);
  if (!res.ok) throw new Error('Falha ao obter cidade pelo IP');
  const data = await res.json();
  return data.city || null;
}

async function buscarCoordPorIP() {
  const res = await fetch(`https://ipinfo.io/json?token=${ipInfoToken}`);
  if (!res.ok) throw new Error('Falha ao obter coordenadas pelo IP');
  const data = await res.json();
  if (!data.loc) return null;
  const [latStr, lonStr] = data.loc.split(',').map(x => x.trim());
  const lat = parseFloat(latStr);
  const lon = parseFloat(lonStr);
  if (Number.isNaN(lat) || Number.isNaN(lon)) throw new Error('Invalid coordinates');
  return [lat, lon] || null;
}

async function buscarNoticias() {
  const query = 'risco de enchente';
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=pt&apiKey=${newsApiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Erro ao buscar notícias');
  const json = await res.json();
  return Array.isArray(json.articles) ? json.articles.slice(0, 2) : [];
}

function formatarDataAtual() {
  const dataAtual = new Date();
  const ano = dataAtual.getFullYear();
  const mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
  const dia = String(dataAtual.getDate()).padStart(2, '0');
  const dia0 = String(Number(dia) - 2).padStart(2, '0');
  return [`${ano}-${mes}-${dia0}`, `${ano}-${mes}-${dia}`];
}

async function fetchFloodData(lat, lon) {
  const [dataInicio, dataFim] = formatarDataAtual();
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    daily: "river_discharge",
    models: "forecast_v4",
    start_date: dataInicio,
    end_date: dataFim
  });
  const url = `https://flood-api.open-meteo.com/v1/flood?${params}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Erro na requisição de flood: ${res.status}`);
  const json = await res.json();
  console.log(json);
  return processFloodData(json);
}

function processFloodData(data) {
  if (!data || !data.daily || !Array.isArray(data.daily.river_discharge)) return [];
  return data.daily.river_discharge.slice(0, 3);
}

async function isFlood(lat, lon) {
  const dadosRio = await fetchFloodData(lat, lon).catch(() => []);
  if (!dadosRio || dadosRio.length < 3) return 'baixo';
  const soma = dadosRio[0] + dadosRio[1] + dadosRio[2];
  const media = soma / 3;
  const variacao = dadosRio[2] - dadosRio[0];
  if (media < 5) return (variacao > 3) ? 'medio' : 'baixo';
  if (media < 10) return (variacao > 3) ? 'alto' : 'medio';
  return 'alto';
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

async function sendPushSubscription(cidade, estado) {
  if (!('serviceWorker' in navigator)) return;
  try {
    // call register on the ServiceWorkerContainer so 'this' is correct
    const registration = await navigator.serviceWorker.register("./sw.js", { scope: "/" });

    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
    });

    let cidadeResolved = cidade;
    if (!cidadeResolved) {
      try {
        cidadeResolved = await buscarCidadePorIP();
      } catch (e) {
        cidadeResolved = cidadePadrao;
      }
    }

    const payload = {
      title: 'VigiaEnchente',
      body: `${cidadeResolved}: risco ${estado}`
    };

    await fetch("http://localhost:3000/subscribe", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // <-- send session cookie so server can set user_id
      body: JSON.stringify({ subscription: sub, payload })
    });

    return sub;
  } catch (err) {
    console.error('sendPushSubscription error:', err);
    throw err;
  }
}

// --- UI updaters (defined at module scope, invoked after DOM ready) ---
function updateWeatherUI(data) {
  if (data?.error) {
    document.querySelector('.weather-title').textContent = 'Erro';
    document.querySelector('.temp_value').textContent = '';
    document.querySelector('.temp_description').textContent = data.message;
    const img = document.querySelector('.temp-img'); if (img) img.src = 'images/error-icon.png';
    return;
  }
  document.querySelector('.weather-title').textContent = data.name;
  document.querySelector('.temp_value').textContent = `${Math.round(data.main.temp)}° C`;
  document.querySelector('.temp_description').textContent = data.weather[0].description;
  const iconCode = data.weather[0].icon;
  const img = document.querySelector('.temp-img'); if (img) img.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  document.querySelector('.temp_max').textContent = `${Math.round(data.main.temp_max)}° C`;
  document.querySelector('.temp_min').textContent = `${Math.round(data.main.temp_min)}° C`;
  document.querySelector('.humidity').textContent = `${data.main.humidity}%`;
  const windSpeed = Math.round(data.wind.speed * 3.6);
  const infoWind = document.querySelector('.info:last-child .temp_max');
  if (infoWind) infoWind.textContent = `${windSpeed} km/h`;
}

function renderNews(articles, container) {
  if (!container) return;
  if (!articles.length) {
    container.innerHTML = "<p>Não foi possível carregar notícias.</p>";
    return;
  }
  container.innerHTML = articles.map(a =>
    `<p><strong>${a.title}</strong></p><a href="${a.url}" target="_blank" rel="noopener">Leia mais</a>`
  ).join('');
}

function updateAlertFromState(estado) {
  const alertEl = document.getElementById("alert");
  const shield = document.getElementById('shield');
  const wrapper = document.querySelector('.alert');
  if (!alertEl || !shield || !wrapper) return;
  if (estado === 'baixo') {
    alertEl.textContent = "Não há risco de enchente";
    shield.src = 'images/shield_green.png';
    wrapper.style.backgroundColor = 'rgba(0, 87, 6, 0.2)';
  } else if (estado === 'medio') {
    alertEl.textContent = "Risco médio de enchente";
    shield.src = 'images/shield_yellow.png';
    wrapper.style.backgroundColor = 'rgba(87, 78, 0, 0.2)';
  } else {
    alertEl.textContent = "Risco alto de enchente";
    shield.src = 'images/shield_red.png';
    wrapper.style.backgroundColor = 'rgba(87, 20, 0, 0.2)';
  }
}

// --- Initialization (single DOMContentLoaded) ---
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', async () => {
    // DOM references
    const newsContainer = document.querySelector(".news-container");

    // Determine city: prefer authenticated user's stored address
    let cidade = null;
    try {
      const resp = await fetch('http://localhost:3000/usuario', { method: 'GET', credentials: 'include' });
      if (resp.ok) {
        const userData = await resp.json();
        cidade = userData.endereco?.cidade || null;
      }
    } catch (e) {
      // ignore, fallback to IP or default
    }

    if (!cidade) {
      try {
        cidade = await buscarCidadePorIP();
      } catch (e) {
        cidade = cidadePadrao;
      }
    }

    // Fetch & render weather
    try {
      const weather = await buscarClima(cidade);
      updateWeatherUI(weather);
    } catch (err) {
      console.error('Erro ao obter/climate:', err);
      updateWeatherUI({ error: true, message: 'Não foi possível obter o clima' });
    }

    // Fetch & render news
    try {
      const articles = await buscarNoticias();
      renderNews(articles, newsContainer);
    } catch (err) {
      console.error('Erro ao buscar notícias:', err);
      renderNews([], newsContainer);
    }

    // Flood alert and UI update
    const coords = await buscarCoord(cidade);
    let lat, lon;
    if (Array.isArray(coords) && coords.length > 0) {
      ({ lat, lon } = coords[0]); // take first result
    } else {
      // fallback to IP-based coords or a default
      const ipCoords = await buscarCoordPorIP().catch(() => null);
      if (ipCoords) {
        [lat, lon] = ipCoords;
      } else {
        // choose an explicit default coordinate if needed
        lat = -19.9208;
        lon = -43.9378;
      }
    }
    console.log(JSON.stringify(coords));
    console.log(`${lat} / ${lon}`);
    let estado = 'baixo';
    try {
      estado = await isFlood(lat, lon);
      updateAlertFromState(estado);
    } catch (err) {
      console.error('Erro ao calcular alerta de enchente:', err);
      estado = 'baixo';
      updateAlertFromState(estado);
    }
    // Register service worker and subscribe to push (run once)
    if ('serviceWorker' in navigator) {
      sendPushSubscription(cidade, estado).catch(err => console.error('Push registration failed:', err));
    }
  });
}

// Export helper functions for Node tests (safe: only sets module.exports when module is defined)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    buscarClima,
    buscarCoord,
    buscarCidadePorIP,
    buscarCoordPorIP,
    buscarNoticias,
    formatarDataAtual,
    fetchFloodData,
    processFloodData,
    isFlood,
    urlBase64ToUint8Array,
    sendPushSubscription,
    updateWeatherUI,
    renderNews,
    updateAlertFromState
  };
}

