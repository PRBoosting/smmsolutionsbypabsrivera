(() => {
  const summary = document.querySelector('.hero-service-summary');
  if (!summary) return;
  summary.classList.add('hero-summary-carousel');
  summary.innerHTML = `<div class="hero-summary-viewport"><div class="hero-summary-track">
    <section class="hero-summary-slide summary-overview"><div class="summary-head"><span>SMM SOLUTIONS</span><b>What we can help with</b></div><a href="#services"><i>01</i><div><small>Social media growth</small><strong>Platform packages &amp; custom requests</strong></div><b>&rarr;</b></a><a href="#website-creation"><i>02</i><div><small>Website creation</small><strong>Business websites from &#8369;1,299</strong></div><b>&rarr;</b></a><a href="#features"><i>03</i><div><small>Customer features</small><strong>Tools, calculator, marketplace &amp; more</strong></div><b>&rarr;</b></a><p>Choose a goal, see the options, then order with confidence.</p></section>
    <section class="hero-summary-slide summary-visual"><p class="summary-kicker">WEBSITE CREATION</p><h2>Professional websites made affordable.</h2><p>Mobile-ready business websites from &#8369;1,299.</p><img src="assets/website-promos/websites-made-affordable.png" alt="Website creation package preview"><a href="#website-creation">Explore website packages &rarr;</a></section>
    <section class="hero-summary-slide summary-visual summary-growth"><p class="summary-kicker">SOCIAL MEDIA GROWTH</p><h2>Reach more people with your content.</h2><p>Explore platform promos for followers, views, engagement, and more.</p><img src="assets/facebook-packages.png" alt="Social media growth package preview"><a href="#services">View growth packages &rarr;</a></section>
  </div></div><div class="summary-controls"><div class="summary-dots"><button class="active" type="button" aria-label="Show overview"></button><button type="button" aria-label="Show website services"></button><button type="button" aria-label="Show growth services"></button></div><div class="summary-arrows"><button type="button" data-summary-previous aria-label="Previous highlight">&lsaquo;</button><button type="button" data-summary-next aria-label="Next highlight">&rsaquo;</button></div></div>`;
  const track = summary.querySelector('.hero-summary-track');
  const slides = Array.from(summary.querySelectorAll('.hero-summary-slide'));
  const dots = Array.from(summary.querySelectorAll('.summary-dots button'));
  let current = 0, timer;
  const update = () => { track.style.transform = `translateX(-${current * 100}%)`; dots.forEach((dot, index) => dot.classList.toggle('active', index === current)); };
  const restart = () => { clearInterval(timer); timer = setInterval(() => { current = (current + 1) % slides.length; update(); }, 7000); };
  summary.querySelector('[data-summary-previous]').addEventListener('click', () => { current = (current - 1 + slides.length) % slides.length; update(); restart(); });
  summary.querySelector('[data-summary-next]').addEventListener('click', () => { current = (current + 1) % slides.length; update(); restart(); });
  dots.forEach((dot, index) => dot.addEventListener('click', () => { current = index; update(); restart(); }));
  summary.addEventListener('mouseenter', () => clearInterval(timer)); summary.addEventListener('mouseleave', restart); update(); restart();
  const proof = document.createElement('section'); proof.className = 'hero-proof-strip'; proof.setAttribute('aria-label', 'SMM Solutions achievements'); proof.innerHTML = '<div class="hero-proof-item"><span class="hero-proof-icon">&#10003;</span><div><b>1,000+</b><small>Happy Clients</small></div></div><div class="hero-proof-item"><span class="hero-proof-icon">&#9633;</span><div><b>10,000+</b><small>Orders Completed</small></div></div><div class="hero-proof-item"><span class="hero-proof-icon">&#9733;</span><div><b>99%</b><small>Positive Feedback</small></div></div><div class="hero-proof-item"><span class="hero-proof-icon">&#9675;</span><div><b>24/7</b><small>Customer Support</small></div></div>';
  summary.closest('.hero').after(proof);
})();
