(() => {
  const selector = document.querySelector('#currency-select');
  if (!selector) return;
  const countryCurrency = { PH:'PHP', US:'USD', GB:'GBP', AU:'AUD', CA:'CAD', SG:'SGD', AE:'AED', JP:'JPY', DE:'EUR', FR:'EUR', IT:'EUR', ES:'EUR', NL:'EUR', IE:'EUR' };
  const saved = localStorage.getItem('smm-display-currency');
  const region = (Intl.DateTimeFormat().resolvedOptions().locale.split('-')[1] || '').toUpperCase();
  let currency = saved || countryCurrency[region] || 'PHP';
  let rate = 1;
  let conversionRequest = 0;
  const format = (amount, selectedCurrency = currency) => new Intl.NumberFormat(undefined, { style:'currency', currency:selectedCurrency, maximumFractionDigits:selectedCurrency === 'JPY' ? 0 : 2 }).format(amount);
  const updateStaticPrices = () => document.querySelectorAll('[data-php]').forEach(item => { const amount = Number(item.dataset.php); item.textContent = `${item.dataset.prefix || ''}${format(amount * rate)}`; item.title = currency === 'PHP' ? 'Original PHP price' : `Approximate conversion. Original: ${format(amount, 'PHP')}`; });
  const notify = () => window.dispatchEvent(new CustomEvent('smmcurrencychange', { detail:{ currency, rate, format } }));
  const setCurrency = async selected => {
    const request = ++conversionRequest;
    currency = selected; selector.value = currency; localStorage.setItem('smm-display-currency', currency); rate = 1; selector.disabled = true;
    if (currency !== 'PHP') try { const response = await fetch(`https://api.frankfurter.dev/v2/rate/PHP/${currency}`); if (!response.ok) throw new Error(); const data = await response.json(); if (request !== conversionRequest) return; rate = data.rate; } catch { if (request !== conversionRequest) return; currency = 'PHP'; selector.value = currency; localStorage.setItem('smm-display-currency', currency); }
    if (request !== conversionRequest) return;
    selector.disabled = false;
    updateStaticPrices(); notify();
  };
  selector.addEventListener('change', event => setCurrency(event.target.value));
  setCurrency(currency);
})();
