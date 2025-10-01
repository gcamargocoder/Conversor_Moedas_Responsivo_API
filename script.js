// Seleção de elementos
const convertButton = document.querySelector(".convert-button");
const currencyFromSelect = document.querySelector(".currency-from-select");
const currencyToSelect = document.querySelector(".currency-to-select");
const currencyValueToConvert = document.querySelector(".currency-value-to-convert");
const currencyValueConverted = document.querySelector(".currency-value");
const currencyName = document.getElementById("currency-name");
const currencyImage = document.querySelector(".currency-img");

// Informações das moedas
const currencies = {
  real: { name: "Real", symbol: "BRL", locale: "pt-BR", image: "./assets/Real.png" },
  dolar: { name: "Dólar", symbol: "USD", locale: "en-US", image: "./assets/Dolar.png" },
  euro: { name: "Euro", symbol: "EUR", locale: "de-DE", image: "./assets/Euro.png" },
  guarani: { name: "Guarani", symbol: "PYG", locale: "es-PY", image: "./assets/Guarani.png" },
  peso: { name: "Peso", symbol: "ARS", locale: "es-AR", image: "./assets/Peso.png" },
  bitcoin: { name: "Bitcoin", symbol: "BTC", locale: "en-US", image: "./assets/Bitcoin.png" }
};

// Formatação
function formatCurrency(value, locale, currencySymbol) {
  if (currencySymbol === "BTC") {
    return value.toFixed(8) + " BTC";
  }
  return new Intl.NumberFormat(locale, { style: "currency", currency: currencySymbol }).format(value);
}

// Contagem crescente animada
function animateValue(element, start, end, duration, locale, symbol) {
  const range = end - start;
  let startTime = null;

  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = timestamp - startTime;
    let current = start + (range * (progress / duration));
    if ((range > 0 && current > end) || (range < 0 && current < end)) current = end;
    element.innerHTML = formatCurrency(current, locale, symbol);
    if (progress < duration) {
      requestAnimationFrame(step);
    } else {
      element.innerHTML = formatCurrency(end, locale, symbol); // garante valor final
    }
  }

  requestAnimationFrame(step);
}

// Busca taxa na API AwesomeAPI
async function fetchRate(from, to) {
  if (from === to) return 1;

  if (from === "BTC" && to === "BRL") {
    const resp = await fetch("https://economia.awesomeapi.com.br/json/last/BTC-BRL");
    const data = await resp.json();
    return parseFloat(data.BTCBRL.bid);
  }

  if (from === "BRL" && to === "BTC") {
    const resp = await fetch("https://economia.awesomeapi.com.br/json/last/BTC-BRL");
    const data = await resp.json();
    return 1 / parseFloat(data.BTCBRL.bid);
  }

  const url = `https://economia.awesomeapi.com.br/json/last/${from}-${to}`;
  const resp = await fetch(url);
  const data = await resp.json();
  const key = from + to;
  return parseFloat(data[key].bid);
}

// Conversão principal
async function convertValues() {
  const amount = parseFloat(document.querySelector(".input-currency").value) || 0;
  const fromKey = currencyFromSelect.value;
  const toKey = currencyToSelect.value;
  const fromCurrency = currencies[fromKey];
  const toCurrency = currencies[toKey];

  if (!fromCurrency || !toCurrency) return;

  // origem → BRL
  let valueInBRL = fromCurrency.symbol === "BRL"
    ? amount
    : amount * await fetchRate(fromCurrency.symbol, "BRL");

  // BRL → destino
  let finalValue = toCurrency.symbol === "BRL"
    ? valueInBRL
    : valueInBRL * await fetchRate("BRL", toCurrency.symbol);

  // Exibe resultados
  currencyValueToConvert.innerHTML = formatCurrency(amount, fromCurrency.locale, fromCurrency.symbol);
  currencyName.innerHTML = toCurrency.name;
  currencyImage.src = toCurrency.image;

  // Animação do resultado
  const resultBox = document.querySelector(".result-box");
  resultBox.classList.remove("animate");
  void resultBox.offsetWidth; // força reflow
  resultBox.classList.add("animate");

  // Contagem crescente para o valor convertido
  animateValue(currencyValueConverted, 0, finalValue, 800, toCurrency.locale, toCurrency.symbol);
}

// Eventos
convertButton.addEventListener("click", convertValues);
currencyFromSelect.addEventListener("change", convertValues);
currencyToSelect.addEventListener("change", convertValues);

// Tema
const themeButton = document.getElementById("theme-button");
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark-mode");
  themeButton.textContent = "☀️";
}

themeButton.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  if (document.body.classList.contains("dark-mode")) {
    themeButton.textContent = "☀️";
    localStorage.setItem("theme", "dark");
  } else {
    themeButton.textContent = "🌙";
    localStorage.setItem("theme", "light");
  }
});

// Inicialização
convertValues();




