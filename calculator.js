const regularRates = {
  Instagram: [
    { name:'Global followers', unit:100, price:39 }, { name:'Hearts / likes', unit:100, price:10 }, { name:'Reel views', unit:1000, price:40 }, { name:'Video views', unit:1000, price:35 }, { name:'Views + reach + impressions', unit:1000, price:250 }, { name:'Shares + engagement + reach', unit:1000, price:120 }, { name:'Story reel views / likes', unit:1000, price:37 }, { name:'Story video views / likes', unit:1000, price:47 }, { name:'Post saves', unit:100, price:15 }
  ],
  Facebook: [
    { name:'Global followers', unit:100, price:30 }, { name:'Pinoy followers', unit:100, price:75 }, { name:'Global reacts', unit:100, price:20 }, { name:'Pinoy reacts', unit:100, price:60 }, { name:'Reel / video views', unit:1000, price:30 }, { name:'Reel / video views (100K rate)', unit:100000, price:720 }, { name:'Minutes views', unit:60000, price:600 }, { name:'Minutes views (600K rate)', unit:600000, price:1000 }, { name:'Live viewers / hour', unit:50, price:45 }, { name:'Comments (PH-based)', unit:20, price:75 }, { name:'Positive reviews', unit:5, price:75 }, { name:'Negative reviews', unit:5, price:150 }, { name:'Global shares', unit:100, price:15 }, { name:'Pinoy shares', unit:100, price:120 }
  ],
  TikTok: [
    { name:'Global followers', unit:100, price:37 }, { name:'Global likes', unit:100, price:20 }, { name:'Video views', unit:1000, price:25 }, { name:'Video shares', unit:100, price:28 }, { name:'Video saves', unit:100, price:26 }
  ],
  'X / Twitter': [
    { name:'Followers', unit:500, price:170 }, { name:'Likes', unit:100, price:180 }, { name:'Tweet views + impressions', unit:100000, price:240 }
  ]
};

const platformSelect = document.querySelector('#calc-platform');
const serviceSelect = document.querySelector('#calc-service');
const quantityInput = document.querySelector('#calc-quantity');
const rateText = document.querySelector('#calc-rate');
const totalText = document.querySelector('#calc-total');
const detailText = document.querySelector('#calc-detail');
const orderButton = document.querySelector('#calc-order');
let displayCurrency = 'PHP';
let exchangeRate = 1;
let formatPrice = value => new Intl.NumberFormat('en-PH', { style:'currency', currency:'PHP', maximumFractionDigits:0 }).format(value);
const php = value => new Intl.NumberFormat('en-PH', { style:'currency', currency:'PHP', maximumFractionDigits:0 }).format(value);

function loadPlatforms() {
  platformSelect.innerHTML = Object.keys(regularRates).map(platform => `<option value="${platform}">${platform}</option>`).join('');
  loadServices();
}
function loadServices() {
  serviceSelect.innerHTML = regularRates[platformSelect.value].map((service, index) => `<option value="${index}">${service.name}</option>`).join('');
  const service = regularRates[platformSelect.value][0];
  quantityInput.value = service.unit;
  quantityInput.min = 1;
  updateEstimate();
}
function updateEstimate() {
  const platform = platformSelect.value;
  const service = regularRates[platform][Number(serviceSelect.value)];
  const quantity = Number(quantityInput.value) || 0;
  const phpEstimate = quantity / service.unit * service.price;
  const phpTotal = Math.ceil(phpEstimate);
  const convertedTotal = displayCurrency === 'PHP' ? phpTotal : phpEstimate * exchangeRate;
  rateText.textContent = `${formatPrice(service.price * exchangeRate)} per ${service.unit.toLocaleString()} ${service.name.toLowerCase()}`;
  totalText.textContent = formatPrice(convertedTotal);
  detailText.textContent = quantity ? `${quantity.toLocaleString()} requested · ${displayCurrency === 'PHP' ? 'PHP regular-rate estimate' : `approximate conversion · PHP reference ${php(phpTotal)}`}` : 'Enter a quantity to calculate.';
  orderButton.href = `https://docs.google.com/forms/d/e/1FAIpQLScyaMF0jMytzyNUKlN-bSIbnXONpPikQS47NKEXNJ58gSCv9g/viewform?usp=publish-editor#custom=${encodeURIComponent(`${platform} ${service.name} - ${quantity} - ${php(phpTotal)}`)}`;
}

platformSelect.addEventListener('change', loadServices);
serviceSelect.addEventListener('change', () => { quantityInput.value = regularRates[platformSelect.value][Number(serviceSelect.value)].unit; updateEstimate(); });
quantityInput.addEventListener('input', updateEstimate);
window.addEventListener('smmcurrencychange', event => { displayCurrency = event.detail.currency; exchangeRate = event.detail.rate; formatPrice = event.detail.format; updateEstimate(); });
loadPlatforms();
