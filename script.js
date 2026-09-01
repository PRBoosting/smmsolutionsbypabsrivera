const year = document.querySelector('[data-year]');
if (year) year.textContent = new Date().getFullYear();

const getPlatformIconMarkup = (platform) => {
  if (platform === 'facebook') return '<i class="fa-brands fa-facebook-f" aria-hidden="true"></i>';
  if (platform === 'instagram') return '<i class="fa-brands fa-instagram" aria-hidden="true"></i>';
  if (platform === 'tiktok') return '<i class="fa-brands fa-tiktok" aria-hidden="true"></i>';
  return '';
};

const navToggle = document.querySelector('[data-nav-toggle]');
const nav = document.querySelector('[data-primary-nav]');
const navItems = document.querySelectorAll('[data-nav-item]');
if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}
if (navItems.length) {
  navItems.forEach((navItem) => {
    const toggle = navItem.querySelector('[data-drop-toggle]');
    toggle?.addEventListener('click', () => {
      const open = !navItem.classList.contains('open');
      navItems.forEach((item) => {
        if (item !== navItem) {
          item.classList.remove('open');
          item.querySelector('[data-drop-toggle]')?.setAttribute('aria-expanded', 'false');
        }
      });
      navItem.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
    });
  });

  document.addEventListener('click', (event) => {
    navItems.forEach((navItem) => {
      if (navItem.contains(event.target)) return;
      navItem.classList.remove('open');
      navItem.querySelector('[data-drop-toggle]')?.setAttribute('aria-expanded', 'false');
    });
  });
}

const quoteForm = document.querySelector('[data-quote-form]');
if (quoteForm) {
  const params = new URLSearchParams(window.location.search);
  const service = params.get('service');
  const minimum = params.get('minimum');
  const rate = params.get('rate');
  const messageField = quoteForm.querySelector('#message');
  const serviceSelect = quoteForm.querySelector('#service');

  if (serviceSelect && service) {
    const normalizedService = service.trim().toLowerCase();
    const match = Array.from(serviceSelect.options).find((option) => option.textContent.trim().toLowerCase() === normalizedService);
    if (match) {
      serviceSelect.value = match.value || match.textContent;
    } else if (normalizedService.includes('facebook')) {
      serviceSelect.value = 'Facebook Services';
    } else if (normalizedService.includes('instagram')) {
      serviceSelect.value = 'Instagram Services';
    } else if (normalizedService.includes('tiktok')) {
      serviceSelect.value = 'TikTok Services';
    } else if (normalizedService.includes('website')) {
      serviceSelect.value = 'Website Design & Development';
    } else if (normalizedService.includes('web-based app') || normalizedService.includes('web app') || normalizedService.includes('system')) {
      serviceSelect.value = 'Web-Based Apps & Systems';
    } else if (normalizedService.includes('booking')) {
      serviceSelect.value = 'Booking / Business System';
    } else {
      serviceSelect.value = 'General Inquiry';
    }
  }
  if (messageField && !messageField.value && service) {
    const lines = [
      `I'm interested in: ${service}`,
      minimum ? `Minimum Order: ${minimum}` : '',
      rate ? `Starting Rate: ${rate}` : '',
    ].filter(Boolean);
    messageField.value = lines.join('\n');
  }
}

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

const filterButtons = document.querySelectorAll('[data-filter]');
const filterCards = document.querySelectorAll('[data-filter-card]');
if (filterButtons.length && filterCards.length) {
  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      filterButtons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
      filterCards.forEach((card) => {
        const show = filter === 'all' || card.dataset.filterCard === filter;
        card.hidden = !show;
      });
    });
  });
}

const tabs = document.querySelectorAll('[data-tab]');
const panels = document.querySelectorAll('[data-tab-panel]');
if (tabs.length && panels.length) {
  const activateTab = (tab) => {
    const target = tab.dataset.tab;
    tabs.forEach((t) => {
      const active = t === tab;
      t.setAttribute('aria-selected', String(active));
      t.setAttribute('tabindex', active ? '0' : '-1');
    });
    panels.forEach((panel) => {
      const active = panel.dataset.tabPanel === target;
      panel.hidden = !active;
      if (active) {
        panel.classList.remove('is-entering');
        void panel.offsetWidth;
        panel.classList.add('is-entering');
      } else {
        panel.classList.remove('is-entering');
      }
    });
  };
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => activateTab(tab));
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const list = Array.from(tabs);
      const currentIndex = list.indexOf(tab);
      let nextIndex = currentIndex;
      if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % list.length;
      if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + list.length) % list.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = list.length - 1;
      list[nextIndex].focus();
      activateTab(list[nextIndex]);
    });
  });
  const activeTab = Array.from(tabs).find((tab) => tab.getAttribute('aria-selected') === 'true') || tabs[0];
  activateTab(activeTab);
}

const fbBundleTabs = document.querySelectorAll('[data-fb-bundle-tab]');
const fbBundlePanels = document.querySelectorAll('[data-fb-bundle-panel]');
if (fbBundleTabs.length && fbBundlePanels.length) {
  const activateFbBundle = (tab) => {
    const target = tab.dataset.fbBundleTab;
    fbBundleTabs.forEach((item) => {
      const active = item === tab;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-selected', String(active));
      item.setAttribute('tabindex', active ? '0' : '-1');
    });
    fbBundlePanels.forEach((panel) => {
      const active = panel.dataset.fbBundlePanel === target;
      panel.hidden = !active;
      panel.classList.remove('is-entering');
      if (active) {
        void panel.offsetWidth;
        panel.classList.add('is-entering');
      }
    });
  };

  fbBundleTabs.forEach((tab) => {
    tab.addEventListener('click', () => activateFbBundle(tab));
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const list = Array.from(fbBundleTabs);
      const currentIndex = list.indexOf(tab);
      let nextIndex = currentIndex;
      if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % list.length;
      if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + list.length) % list.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = list.length - 1;
      list[nextIndex].focus();
      activateFbBundle(list[nextIndex]);
    });
  });

  const activeBundle = Array.from(fbBundleTabs).find((tab) => tab.getAttribute('aria-selected') === 'true') || fbBundleTabs[0];
  activateFbBundle(activeBundle);
}

const minimumRatesApp = document.querySelector('[data-minimum-rates-app]');
if (minimumRatesApp) {
  const dataNode = document.querySelector('#minimum-rates-data');
  const searchInput = minimumRatesApp.querySelector('[data-rates-search]');
  const filterButtons = Array.from(minimumRatesApp.querySelectorAll('[data-rates-filter]'));
  const tableBody = minimumRatesApp.querySelector('[data-rates-table-body]');
  const mobileList = minimumRatesApp.querySelector('[data-rates-mobile-list]');
  const emptyState = minimumRatesApp.querySelector('[data-rates-empty]');
  const rates = dataNode ? JSON.parse(dataNode.textContent) : [];
  let activePlatform = 'all';
  let activeSearch = '';

  const buildInquiryHref = (item) => {
    const params = new URLSearchParams({
      service: item.contactService,
      minimum: item.minimum,
      rate: item.startingPrice,
    });
    return `contact.html?${params.toString()}`;
  };

  const matchesFilter = (item) => {
    const haystack = `${item.serviceName} ${item.service} ${item.audience} ${item.platform} ${item.label}`.toLowerCase();
    const matchesPlatform = activePlatform === 'all' || item.platform === activePlatform;
    const matchesSearch = !activeSearch || haystack.includes(activeSearch);
    return matchesPlatform && matchesSearch;
  };

  const renderRates = () => {
    const visible = rates.filter(matchesFilter);

    tableBody.innerHTML = visible.map((item) => `
      <tr>
        <td class="minimum-rate-id">${item.id}</td>
        <td>
          <div class="minimum-rate-service">
            <span class="minimum-rate-platform">${getPlatformIconMarkup(item.platform)} ${item.label}</span>
            <strong>${item.service}</strong>
            <span>${item.serviceName}</span>
          </div>
        </td>
        <td>${item.audience}</td>
        <td>
          <div class="minimum-rate-minimum">
            <strong>${item.minimum}</strong>
            ${item.note ? `<span class="minimum-rate-note">${item.note}</span>` : ''}
          </div>
        </td>
        <td>
          <div class="minimum-rate-price">
            <span>Starting at</span>
            <strong>${item.startingPrice}</strong>
          </div>
        </td>
        <td><a class="minimum-rate-action" href="${buildInquiryHref(item)}">Inquire <i data-lucide="arrow-right"></i></a></td>
      </tr>
    `).join('');

    mobileList.innerHTML = visible.map((item) => `
      <article class="minimum-rate-mobile-card">
        <div class="minimum-rate-mobile-head">
          <div class="minimum-rate-service">
            <span class="minimum-rate-platform">${getPlatformIconMarkup(item.platform)} ${item.label}</span>
            <strong>${item.serviceName}</strong>
          </div>
          <div class="minimum-rate-price">
            <span>Starting at</span>
            <strong>${item.startingPrice}</strong>
          </div>
        </div>
        <div class="minimum-rate-mobile-body">
          <div class="minimum-rate-mobile-grid">
            <div class="minimum-rate-mobile-item">
              <span>Audience</span>
              <strong>${item.audience}</strong>
            </div>
            <div class="minimum-rate-mobile-item">
              <span>Minimum</span>
              <strong>${item.minimum}</strong>
            </div>
          </div>
          ${item.note ? `<p class="minimum-rate-note">${item.note}</p>` : ''}
          <a class="minimum-rate-action" href="${buildInquiryHref(item)}">Inquire <i data-lucide="arrow-right"></i></a>
        </div>
      </article>
    `).join('');

    emptyState.hidden = visible.length > 0;
    if (window.lucide) lucide.createIcons();
  };

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      activePlatform = button.dataset.ratesFilter;
      filterButtons.forEach((item) => {
        item.setAttribute('aria-selected', String(item === button));
      });
      renderRates();
    });
  });

  searchInput?.addEventListener('input', () => {
    activeSearch = searchInput.value.trim().toLowerCase();
    renderRates();
  });

  renderRates();
}

const resultsShowcase = document.querySelector('[data-results-showcase]');
if (resultsShowcase) {
  const tabButtons = Array.from(document.querySelectorAll('[data-results-tab]'));
  const prevBtn = resultsShowcase.querySelector('[data-results-prev]');
  const nextBtn = resultsShowcase.querySelector('[data-results-next]');
  const panel = resultsShowcase.querySelector('.featured-results-panel');
  const image = resultsShowcase.querySelector('[data-results-image]');
  const label = resultsShowcase.querySelector('[data-results-label]');
  const title = resultsShowcase.querySelector('[data-results-title]');
  const statusWrap = resultsShowcase.querySelector('[data-results-status-wrap]');
  const status = resultsShowcase.querySelector('[data-results-status]');
  const description = resultsShowcase.querySelector('[data-results-description]');
  const compare = resultsShowcase.querySelector('[data-results-compare]');
  const compareArrow = resultsShowcase.querySelector('[data-results-compare-arrow]');
  const beforeLabel = resultsShowcase.querySelector('[data-results-before-label]');
  const afterLabel = resultsShowcase.querySelector('[data-results-after-label]');
  const beforeValue = resultsShowcase.querySelector('[data-results-before]');
  const afterValue = resultsShowcase.querySelector('[data-results-after]');
  const chips = resultsShowcase.querySelector('[data-results-chips]');
  const primary = resultsShowcase.querySelector('[data-results-primary]');
  const secondary = resultsShowcase.querySelector('[data-results-secondary]');
  const note = resultsShowcase.querySelector('[data-results-note]');
  const currentOutput = resultsShowcase.querySelector('[data-results-current]');
  const totalOutput = resultsShowcase.querySelector('[data-results-total]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const data = {
    facebook: [
      {
        platform: 'facebook',
        resultType: 'monetization',
        type: 'result',
        label: 'FACEBOOK CONTENT MONETIZATION',
        title: 'Content Monetization Progress',
        description: 'A completed Facebook growth result showing the required 300K-view target successfully reached and exceeded.',
        beforeLabel: 'STARTING POINT',
        before: '27,870 / 300K Views',
        afterLabel: 'TARGET EXCEEDED',
        after: '329,384 / 300K Views',
        badge: 'RESULT',
        image: 'assets/images/results/749286519_1441966414622273_276257707101894405_n.jpg',
        alt: 'Before and after content monetization progress proof showing 27,870 before and 329,384 after',
        primaryText: 'Explore Facebook Packages',
        primaryHref: 'facebook-packages.html',
        secondaryText: 'View More Results',
        secondaryHref: 'projects.html',
        note: 'Results shown are examples from previous orders. Individual results may vary.'
      },
      {
        platform: 'facebook',
        resultType: 'groupGrowth',
        type: 'result',
        label: 'FACEBOOK GROUP GROWTH',
        title: 'Facebook Group Growth',
        description: 'A completed Facebook Group Growth project showing member growth from 53 to 150K.',
        before: '53 Members',
        after: '150K Members',
        badge: 'RESULT',
        image: 'assets/images/results/782144947_1473515458134035_6791231054366823258_n.jpg',
        alt: 'Facebook group growth proof artwork showing 53 members before and 150K members after',
        primaryText: 'Explore Facebook Packages',
        primaryHref: 'facebook-packages.html',
        secondaryText: 'View More Results',
        secondaryHref: 'projects.html',
        note: 'Results shown are examples from previous orders. Individual results may vary.'
      },
      {
        platform: 'facebook',
        resultType: 'followers',
        type: 'result',
        label: 'FACEBOOK FOLLOWER GROWTH',
        title: 'Follower Growth Result',
        description: 'Before-and-after follower growth from a previous Facebook client order.',
        before: '2K followers',
        after: '3.1K followers',
        badge: 'RESULT',
        image: 'assets/images/results/484455242_619734907513804_6893774838957265462_n.jpg',
        alt: 'Before and after Facebook audience growth proof showing 2K followers before and 3.1K followers after',
        primaryText: 'Explore Facebook Packages',
        primaryHref: 'facebook-packages.html',
        secondaryText: 'View More Results',
        secondaryHref: 'projects.html',
        note: 'Results shown are examples from previous orders. Individual results may vary.'
      },
      {
        platform: 'facebook',
        resultType: 'monetization',
        type: 'result',
        label: 'FACEBOOK GROWTH RESULT',
        title: 'Growth Order & Client Update',
        description: 'Client feedback received after the successful delivery of a 10K follower and 150K unique views order.',
        beforeLabel: 'ORDER DELIVERED',
        before: '10K Followers + 150K Unique Views',
        afterLabel: 'CLIENT UPDATE',
        after: 'Content Monetization Approved',
        badge: 'CLIENT FEEDBACK',
        image: 'assets/images/results/647080221_899129966240962_4926765733496365533_n.jpg',
        alt: 'Facebook growth delivery and content monetization approval proof screenshot',
        primaryText: 'Explore Facebook Packages',
        primaryHref: 'facebook-packages.html',
        secondaryText: 'View More Results',
        secondaryHref: 'projects.html',
        note: 'Results shown are examples from previous orders. Individual results may vary.'
      },
      {
        platform: 'facebook',
        resultType: 'followers',
        type: 'result',
        label: 'FACEBOOK FOLLOWER GROWTH',
        title: 'Follower Growth Result',
        description: 'Before-and-after follower growth from a previous Facebook client order.',
        before: '69K followers',
        after: '71K followers',
        badge: 'RESULT',
        image: 'assets/images/results/743118937_1436932628458985_493130991922416659_n.jpg',
        alt: 'Before and after Facebook follower growth proof showing 69K followers before and 71K followers after',
        primaryText: 'Explore Facebook Packages',
        primaryHref: 'facebook-packages.html',
        secondaryText: 'View More Results',
        secondaryHref: 'projects.html',
        note: 'Results shown are examples from previous orders. Individual results may vary.'
      },
      {
        platform: 'facebook',
        resultType: 'followers',
        type: 'result',
        label: 'FACEBOOK FOLLOWER GROWTH',
        title: 'Facebook Follower Growth',
        description: 'A documented before-and-after example of follower growth from a previous order.',
        before: '3K',
        after: '63K',
        badge: 'RESULT',
        image: 'assets/images/results/763355853_1458653892953525_7486583502211611794_n.jpg',
        alt: 'Before and after follower growth proof showing 3K followers before and 63K followers after',
        primaryText: 'Explore Facebook Packages',
        primaryHref: 'facebook-packages.html',
        secondaryText: 'View More Results',
        secondaryHref: 'projects.html',
        note: 'Results shown are examples from previous orders. Individual results may vary.'
      },
      {
        platform: 'facebook',
        resultType: 'videoViews',
        type: 'result',
        label: 'FACEBOOK VIDEO VIEWS',
        title: 'Video View Growth',
        description: 'Before-and-after video view growth from a previous completed order.',
        before: '632',
        after: '4.6M',
        badge: 'RESULT',
        image: 'assets/images/results/616376813_859091876911438_8231310007882916843_n.jpg',
        alt: 'Facebook video views proof showing 632 before and 4.6M after',
        primaryText: 'Explore Facebook Packages',
        primaryHref: 'facebook-packages.html',
        secondaryText: 'View More Results',
        secondaryHref: 'projects.html',
        note: 'Results shown are examples from previous orders. Individual results may vary.'
      }
    ],
    instagram: [
      {
        platform: 'instagram',
        resultType: 'followers',
        type: 'result',
        label: 'INSTAGRAM FOLLOWER GROWTH',
        title: 'Instagram Follower Growth',
        description: 'Follower growth documented from a previous Instagram order.',
        before: '36',
        after: '1,056',
        badge: 'RESULT',
        image: 'assets/images/results/487161916_631425579678070_6463408006060602439_n.jpg',
        alt: 'Instagram follower proof showing 36 followers before and 1,056 followers after',
        primaryText: 'Explore Instagram Packages',
        primaryHref: 'instagram-packages.html',
        secondaryText: 'View More Results',
        secondaryHref: 'projects.html',
        note: 'Results shown are examples from previous orders. Individual results may vary.'
      },
      {
        platform: 'instagram',
        resultType: 'videoViews',
        type: 'result',
        label: 'INSTAGRAM VIDEO VIEWS',
        title: 'Instagram View Growth',
        description: 'Instagram view growth documented from a previous completed order.',
        before: '3,051',
        after: '9.41M',
        badge: 'RESULT',
        image: 'assets/images/results/615367181_859091956911430_1021556828327396831_n.jpg',
        alt: 'Instagram views proof showing 3,051 before and 9.41M after',
        primaryText: 'Explore Instagram Packages',
        primaryHref: 'instagram-packages.html',
        secondaryText: 'View More Results',
        secondaryHref: 'projects.html',
        note: 'Results shown are examples from previous orders. Individual results may vary.'
      }
    ],
    tiktok: [
      {
        platform: 'tiktok',
        resultType: 'followers',
        type: 'result',
        label: 'TIKTOK FOLLOWER GROWTH',
        title: 'TikTok Follower Growth',
        description: 'Before-and-after follower growth from a previous TikTok order.',
        before: '25',
        after: '1,843',
        badge: 'RESULT',
        image: 'assets/images/results/487453078_634786389341989_9072707458216703043_n.jpg',
        alt: 'TikTok follower proof showing 25 followers before and 1,843 followers after',
        primaryText: 'Explore TikTok Packages',
        primaryHref: 'tiktok-packages.html',
        secondaryText: 'View More Results',
        secondaryHref: 'projects.html',
        note: 'Results shown are examples from previous orders. Individual results may vary.'
      },
      {
        platform: 'tiktok',
        resultType: 'likes',
        type: 'result',
        label: 'TIKTOK ENGAGEMENT',
        title: 'TikTok Like Growth',
        description: 'Before-and-after likes from a completed TikTok engagement order.',
        before: '10',
        after: '3,027',
        badge: 'RESULT',
        image: 'assets/images/results/487478465_634782816009013_4218187340578733112_n.jpg',
        alt: 'TikTok proof showing likes and views growth before and after',
        primaryText: 'Explore TikTok Packages',
        primaryHref: 'tiktok-packages.html',
        secondaryText: 'View More Results',
        secondaryHref: 'projects.html',
        note: 'Results shown are examples from previous orders. Individual results may vary.'
      },
      {
        platform: 'tiktok',
        resultType: 'testimonial',
        type: 'testimonial',
        label: 'TIKTOK CLIENT FEEDBACK',
        title: 'TikTok Customer Feedback',
        description: 'Customer feedback received after a completed TikTok likes and views order.',
        badge: 'CLIENT FEEDBACK',
        beforeLabel: 'Verified Feedback',
        before: 'Client Feedback',
        afterLabel: 'Client Type',
        after: 'Previous Customer',
        image: 'assets/images/results/508384090_692255856928375_4977251875429780626_n.jpg',
        alt: 'TikTok client feedback screenshot about likes and views delivery',
        primaryText: 'Explore TikTok Packages',
        primaryHref: 'tiktok-packages.html',
        secondaryText: 'View More Results',
        secondaryHref: 'projects.html',
        note: ''
      }
    ],
    general: [
      {
        platform: 'general',
        resultType: 'videoViews',
        image: 'assets/images/results/484149284_620885264065435_3251030208839795312_n.jpg'
      },
      {
        platform: 'general',
        resultType: 'livestream',
        image: 'assets/images/results/484902852_620885280732100_4008654274902361510_n.jpg'
      },
      {
        platform: 'general',
        resultType: 'engagement',
        image: 'assets/images/results/616086501_859497953537497_233331277891186771_n.jpg'
      },
      {
        platform: 'general',
        resultType: 'views',
        image: 'assets/images/results/616376813_859091876911438_8231310007882916843_n.jpg'
      },
      {
        platform: 'general',
        resultType: 'views',
        image: 'assets/images/results/702612228_1392730719545843_8969618135637259470_n.jpg'
      },
      {
        platform: 'general',
        resultType: 'testimonial',
        type: 'testimonial',
        label: 'CLIENT FEEDBACK',
        title: 'Another Satisfied Customer',
        description: 'Positive feedback received from a customer after a completed order.',
        badge: 'CLIENT FEEDBACK',
        beforeLabel: 'Verified Feedback',
        before: 'Client Feedback',
        afterLabel: 'Client Type',
        after: 'Previous Customer',
        image: 'assets/images/results/485306133_623745990446029_1939373758717009698_n.jpg',
        alt: 'General client feedback screenshot thanking the service for fast delivery',
        primaryText: 'Contact for a Quote',
        primaryHref: 'contact.html',
        secondaryText: 'View More Results',
        secondaryHref: 'projects.html',
        note: ''
      }
    ],
    websites: [
      {
        platform: 'websites',
        type: 'website',
        label: 'FOOD & BEVERAGE WEBSITE',
        title: "Let's Bean Coffee",
        description: 'A responsive cafe website designed to showcase the brand, menu, and business online.',
        badge: 'COMPLETED PROJECT',
        projectType: 'Food & Beverage Website',
        projectStatus: 'Successfully Delivered',
        image: 'assets/images/results/779392386_1472644524887795_4202645799927218682_n.jpg',
        alt: 'Completed website project artwork for Let’s Bean Coffee showing desktop and mobile views',
        chips: ['Responsive Design', 'Content Management', 'Mobile Friendly'],
        primaryText: 'View Website',
        primaryHref: 'https://lets-beancoffee.netlify.app/',
        secondaryText: 'View All Website Projects',
        secondaryHref: 'websites.html',
        note: '',
        mode: 'website'
      },
      {
        platform: 'websites',
        type: 'website',
        label: 'BEAUTY BUSINESS WEBSITE',
        title: 'Trive Beauty Lounge',
        description: 'A professional beauty business website designed to showcase services and make customer inquiries easier.',
        badge: 'COMPLETED PROJECT',
        projectType: 'Beauty Business Website',
        projectStatus: 'Successfully Delivered',
        image: 'assets/images/results/764832869_1460119292806985_3104475838041324465_n.jpg',
        alt: 'Completed website project artwork for Trive Beauty Lounge',
        chips: ['Responsive Design', 'Mobile Friendly', 'Professional Website'],
        primaryText: 'View Website',
        primaryHref: 'websites.html',
        secondaryText: 'View All Website Projects',
        secondaryHref: 'websites.html',
        note: '',
        mode: 'website'
      },
      {
        platform: 'websites',
        type: 'website',
        label: 'ONLINE PRODUCT WEBSITE',
        title: 'MM Laboratory Supplies',
        description: 'A product-focused website designed to organize laboratory supplies and simplify customer inquiries.',
        badge: 'COMPLETED PROJECT',
        projectType: 'Online Product Website',
        projectStatus: 'Successfully Delivered',
        image: 'assets/images/results/772707732_1466385028847078_6782598962401340377_n.jpg',
        alt: 'Completed website project artwork for MM Laboratory Supplies',
        chips: ['Responsive Design', 'CMS Integrated', 'Mobile Friendly'],
        primaryText: 'View Website',
        primaryHref: 'websites.html',
        secondaryText: 'View All Website Projects',
        secondaryHref: 'websites.html',
        note: '',
        mode: 'website'
      },
      {
        platform: 'websites',
        type: 'website',
        label: 'AIR-CONDITIONING WEBSITE',
        title: 'Koolmate Airconditioning',
        description: 'A responsive service website showcasing air-conditioning services, products, promotions, and customer inquiries.',
        badge: 'COMPLETED PROJECT',
        projectType: 'Business & Service Website',
        projectStatus: 'Successfully Delivered',
        image: 'assets/images/results/778124088_1470092891809625_6116320071456651848_n.jpg',
        alt: 'Completed website project artwork for Koolmate Airconditioning Services and Maintenance',
        chips: ['Responsive Design', 'Mobile Friendly', 'Professional Website'],
        primaryText: 'View Website',
        primaryHref: 'websites.html',
        secondaryText: 'View All Website Projects',
        secondaryHref: 'websites.html',
        note: '',
        mode: 'website'
      },
      {
        platform: 'websites',
        type: 'website',
        label: 'ONLINE BOOKING SYSTEM',
        title: 'Online Inquiry & Booking System',
        description: 'A responsive online booking system designed to make appointment requests easier for both businesses and their customers.',
        badge: 'LIVE SYSTEM DEMO',
        projectType: 'Booking & Inquiry System',
        projectStatus: 'Live Demo',
        image: 'assets/images/results/booking-system-showcase.png',
        alt: 'Customer-facing online booking system demo shown in desktop and mobile layouts',
        chips: ['Online Booking', 'Service Selection', 'Date & Time Selection', 'Mobile Friendly'],
        primaryText: 'View Live Demo',
        primaryHref: 'https://slotwisemvp.netlify.app/katseye-hair-salon',
        secondaryText: 'View All Web Projects',
        secondaryHref: 'websites.html',
        note: '',
        mode: 'website',
        external: true
      }
    ]
  };

  let activeCategory = 'facebook';
  let activeIndex = { facebook: 0, instagram: 0, tiktok: 0, websites: 0 };
  let timerId = null;
  let touchStartX = null;

  const formatCount = (value) => String(value + 1).padStart(2, '0');

  const setTabState = (tabKey) => {
    activeCategory = tabKey;
    tabButtons.forEach((button) => {
      const active = button.dataset.resultsTab === tabKey;
      button.setAttribute('aria-selected', String(active));
      button.setAttribute('tabindex', active ? '0' : '-1');
    });
  };

  const renderChips = (items = []) => {
    chips.innerHTML = '';
    items.forEach((item) => {
      const chip = document.createElement('span');
      chip.textContent = item;
      chips.appendChild(chip);
    });
  };

  const applySlide = () => {
    const slides = data[activeCategory];
    const current = slides[activeIndex[activeCategory]] || slides[0];
    const isWebsite = current.type === 'website' || current.mode === 'website';
    const isTestimonial = current.type === 'testimonial';

    image.src = current.image;
    image.alt = current.alt;
    label.textContent = current.label;
    title.textContent = current.title;
    description.textContent = current.description;

    if (isWebsite) {
      statusWrap.hidden = false;
      status.textContent = current.badge || 'COMPLETED PROJECT';
      compare.hidden = false;
      beforeLabel.textContent = 'Project Type';
      beforeValue.textContent = current.projectType || '';
      afterLabel.textContent = 'Status';
      afterValue.textContent = current.projectStatus || '';
      compareArrow.hidden = true;
      renderChips(current.chips || []);
      note.hidden = true;
    } else {
      statusWrap.hidden = false;
      status.textContent = current.badge === 'RESULT' ? 'VERIFIED RESULT' : (current.badge || 'VERIFIED RESULT');
      compare.hidden = false;
      beforeLabel.textContent = current.beforeLabel || 'Before';
      afterLabel.textContent = current.afterLabel || 'After';
      beforeValue.textContent = current.before || '';
      afterValue.textContent = current.after || '';
      compareArrow.hidden = isTestimonial;
      renderChips([]);
      note.hidden = !current.note;
      note.textContent = current.note || '';
    }

    primary.href = current.primaryHref;
    primary.innerHTML = `${current.primaryText} <i data-lucide="arrow-right"></i>`;
    if (current.external) {
      primary.target = '_blank';
      primary.rel = 'noopener noreferrer';
    } else {
      primary.removeAttribute('target');
      primary.removeAttribute('rel');
    }
    secondary.href = current.secondaryHref;
    secondary.innerHTML = `${current.secondaryText} <i data-lucide="arrow-right"></i>`;
    secondary.removeAttribute('target');
    secondary.removeAttribute('rel');

    currentOutput.textContent = formatCount(activeIndex[activeCategory]);
    totalOutput.textContent = String(slides.length).padStart(2, '0');

    if (window.lucide?.createIcons) {
      lucide.createIcons();
    }
  };

  const animateAndRender = () => {
    panel.classList.add('is-switching');
    window.setTimeout(() => {
      applySlide();
      panel.classList.remove('is-switching');
    }, reduceMotion.matches ? 0 : 180);
  };

  const stopAuto = () => {
    if (timerId) {
      window.clearInterval(timerId);
      timerId = null;
    }
  };

  const startAuto = () => {
    stopAuto();
    const slides = data[activeCategory];
    if (reduceMotion.matches || slides.length < 2) return;
    timerId = window.setInterval(() => {
      activeIndex[activeCategory] = (activeIndex[activeCategory] + 1) % slides.length;
      animateAndRender();
    }, 6500);
  };

  const goToSlide = (direction) => {
    const slides = data[activeCategory];
    activeIndex[activeCategory] = (activeIndex[activeCategory] + direction + slides.length) % slides.length;
    animateAndRender();
    startAuto();
  };

  tabButtons.forEach((button) => {
    button.addEventListener('click', () => {
      setTabState(button.dataset.resultsTab);
      animateAndRender();
      startAuto();
    });
    button.addEventListener('keydown', (event) => {
      if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const list = tabButtons;
      const currentIndex = list.indexOf(button);
      let nextIndex = currentIndex;
      if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % list.length;
      if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + list.length) % list.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = list.length - 1;
      const nextTab = list[nextIndex];
      nextTab.focus();
      setTabState(nextTab.dataset.resultsTab);
      animateAndRender();
      startAuto();
    });
  });

  prevBtn?.addEventListener('click', () => goToSlide(-1));
  nextBtn?.addEventListener('click', () => goToSlide(1));

  resultsShowcase.addEventListener('mouseenter', stopAuto);
  resultsShowcase.addEventListener('mouseleave', startAuto);
  resultsShowcase.addEventListener('focusin', stopAuto);
  resultsShowcase.addEventListener('focusout', (event) => {
    if (!resultsShowcase.contains(event.relatedTarget)) startAuto();
  });
  resultsShowcase.addEventListener('touchstart', (event) => {
    touchStartX = event.touches[0]?.clientX ?? null;
  }, { passive: true });
  resultsShowcase.addEventListener('touchend', (event) => {
    if (touchStartX === null) return;
    const endX = event.changedTouches[0]?.clientX ?? touchStartX;
    const deltaX = endX - touchStartX;
    touchStartX = null;
    if (Math.abs(deltaX) < 36) return;
    goToSlide(deltaX > 0 ? -1 : 1);
  }, { passive: true });

  setTabState(activeCategory);
  applySlide();
  startAuto();
}

const modal = document.querySelector('[data-modal]');
const modalImg = modal?.querySelector('img');
const modalTitle = modal?.querySelector('[data-modal-title]');
document.querySelectorAll('[data-open-modal]').forEach((button) => {
  button.addEventListener('click', () => {
    if (!modal || !modalImg || !modalTitle) return;
    modalImg.src = button.dataset.image || '';
    modalImg.alt = button.dataset.alt || '';
    modalTitle.textContent = button.dataset.title || '';
    modal.showModal();
  });
});
document.querySelectorAll('[data-close-modal]').forEach((button) => {
  button.addEventListener('click', () => modal?.close());
});
modal?.addEventListener('click', (event) => {
  if (event.target === modal) modal.close();
});

const form = document.querySelector('[data-quote-form]');
if (form) {
  const status = document.querySelector('[data-form-status]');
  const nameInput = form.querySelector('#name');
  const emailInput = form.querySelector('#email');
  const phoneInput = form.querySelector('#phone');
  const serviceInput = form.querySelector('#service');
  const budgetInput = form.querySelector('#budget');
  const messageInput = form.querySelector('#message');
  const followupAction = form.querySelector('.contact-followup-action');
  const fieldErrors = new Map(
    Array.from(form.querySelectorAll('[data-error-for]')).map((node) => [node.dataset.errorFor, node]),
  );

  const setStatusMessage = (message, state) => {
    if (!status) return;
    status.textContent = message;
    if (state) {
      status.dataset.state = state;
    } else {
      delete status.dataset.state;
    }
  };

  const setFieldError = (input, message = '') => {
    if (!input) return;
    const wrapper = input.closest('.field');
    const errorNode = fieldErrors.get(input.id);
    wrapper?.classList.toggle('has-error', Boolean(message));
    if (errorNode) errorNode.textContent = message;
  };

  const clearFieldError = (input) => {
    if (!input) return;
    input.setCustomValidity('');
    setFieldError(input, '');
  };

  const validPhoneNumber = (value) => /^[+()\d\s-]{7,20}$/.test(value.trim());

  const validators = [
    {
      input: nameInput,
      validate: (value) => value.trim().length > 0,
      message: 'Please enter your name.',
    },
    {
      input: emailInput,
      validate: (value, input) => value.trim().length === 0 || input.validity.valid,
      message: 'Please enter a valid email address.',
    },
    {
      input: phoneInput,
      validate: (value) => value.trim().length === 0 || validPhoneNumber(value),
      message: 'Please enter a valid contact number.',
    },
    {
      input: serviceInput,
      validate: (value) => value.trim().length > 0,
      message: 'Please select a service.',
    },
    {
      input: messageInput,
      validate: (value) => value.trim().length > 0,
      message: 'Please tell us a little about what you need.',
    },
  ];

  validators.forEach(({ input, message }) => {
    if (!input) return;
    input.addEventListener('input', () => {
      clearFieldError(input);
      if (followupAction) followupAction.hidden = true;
      if (status && status.dataset.state === 'error') {
        setStatusMessage("Complete the form and we'll prepare your inquiry details for sending.");
      }
    });
    input.addEventListener('change', () => clearFieldError(input));
    input.addEventListener('invalid', () => {
      input.setCustomValidity(message);
      setFieldError(input, message);
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (followupAction) followupAction.hidden = true;

    for (const { input, validate, message } of validators) {
      if (!input) continue;
      clearFieldError(input);
      if (!validate(input.value, input)) {
        input.setCustomValidity(message);
        setFieldError(input, message);
        input.reportValidity();
        setStatusMessage(message, 'error');
        return;
      }
    }

    const details = [
      'Hello SMM Solutions,',
      '',
      'I would like to send an inquiry.',
      '',
      `Full Name: ${nameInput?.value.trim() || ''}`,
      emailInput?.value.trim() ? `Email Address: ${emailInput.value.trim()}` : '',
      phoneInput?.value.trim() ? `Contact Number: ${phoneInput.value.trim()}` : '',
      `Service: ${serviceInput?.value.trim() || ''}`,
      budgetInput?.value.trim() ? `Budget: ${budgetInput.value.trim()}` : '',
      '',
      'Inquiry Details:',
      messageInput?.value.trim() || '',
    ].filter(Boolean);

    const inquiryMessage = details.join('\n');
    const messengerUrl = 'https://m.me/smmsolutionsv2';

    const openMessenger = () => {
      window.open(messengerUrl, '_blank', 'noopener,noreferrer');
      if (followupAction) followupAction.hidden = false;
      setStatusMessage('Inquiry details copied. Paste the message in Messenger and send it to us.', 'info');
    };

    const fallbackCopy = () => {
      const helper = document.createElement('textarea');
      helper.value = inquiryMessage;
      helper.setAttribute('readonly', '');
      helper.style.position = 'absolute';
      helper.style.left = '-9999px';
      document.body.appendChild(helper);
      helper.select();
      helper.setSelectionRange(0, helper.value.length);
      let copied = false;
      try {
        copied = document.execCommand('copy');
      } catch (error) {
        copied = false;
      }
      document.body.removeChild(helper);
      return copied;
    };

    const copyAndOpen = async () => {
      let copied = false;
      if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(inquiryMessage);
          copied = true;
        } catch (error) {
          copied = fallbackCopy();
        }
      } else {
        copied = fallbackCopy();
      }

      openMessenger();

      if (!copied) {
        setStatusMessage('Messenger opened. If the message was not copied automatically, please copy your details from the form and send them to us in Messenger.', 'info');
      }
    };

    void copyAndOpen();
  });
}

const websiteHeroCarousel = document.querySelector('[data-website-hero-carousel]');
if (websiteHeroCarousel) {
  const slides = Array.from(websiteHeroCarousel.querySelectorAll('[data-website-slide]'));
  const indicators = Array.from(websiteHeroCarousel.querySelectorAll('[data-website-indicator]'));
  const caption = websiteHeroCarousel.querySelector('[data-website-caption]');
  const captionTitle = caption?.querySelector('strong');
  const captionStyle = caption?.querySelector('span');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const autoplayDelay = 5000;
  let activeIndex = 0;
  let autoplayId = null;

  const applySlide = (index) => {
    activeIndex = index;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === index);
    });
    indicators.forEach((indicator, indicatorIndex) => {
      const isActive = indicatorIndex === index;
      indicator.classList.toggle('is-active', isActive);
      indicator.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
    if (caption) {
      const title = slides[index]?.dataset.title || '';
      const style = slides[index]?.dataset.style || '';
      if (captionTitle) {
        captionTitle.textContent = title;
      } else {
        caption.textContent = title;
      }
      if (captionStyle) {
        captionStyle.textContent = style;
      }
    }
  };

  const clearAutoplay = () => {
    if (autoplayId) {
      window.clearInterval(autoplayId);
      autoplayId = null;
    }
  };

  const startAutoplay = () => {
    clearAutoplay();
    if (reducedMotion.matches || document.hidden || slides.length < 2) return;
    autoplayId = window.setInterval(() => {
      applySlide((activeIndex + 1) % slides.length);
    }, autoplayDelay);
  };

  indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
      applySlide(index);
      startAutoplay();
    });
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      clearAutoplay();
    } else {
      startAutoplay();
    }
  });

  if (typeof reducedMotion.addEventListener === 'function') {
    reducedMotion.addEventListener('change', () => {
      if (reducedMotion.matches) {
        clearAutoplay();
        applySlide(0);
      } else {
        startAutoplay();
      }
    });
  }

  applySlide(0);
  startAutoplay();
}

const projectsProofCarousel = document.querySelector('[data-projects-proof-carousel]');
if (projectsProofCarousel) {
  const slides = Array.from(projectsProofCarousel.querySelectorAll('[data-projects-proof-slide]'));
  const indicators = Array.from(projectsProofCarousel.querySelectorAll('[data-projects-proof-indicator]'));
  const captionTitle = projectsProofCarousel.querySelector('[data-projects-proof-caption] strong');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const autoplayDelay = 5000;
  let activeIndex = 0;
  let autoplayId = null;

  const applySlide = (index) => {
    activeIndex = index;
    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === activeIndex;
      slide.classList.toggle('is-active', isActive);
      slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
    });
    indicators.forEach((indicator, indicatorIndex) => {
      const isActive = indicatorIndex === activeIndex;
      indicator.classList.toggle('is-active', isActive);
      indicator.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
    if (captionTitle) captionTitle.textContent = slides[activeIndex]?.dataset.title || '';
  };

  const stopAutoplay = () => {
    if (!autoplayId) return;
    window.clearInterval(autoplayId);
    autoplayId = null;
  };

  const startAutoplay = () => {
    stopAutoplay();
    if (reducedMotion.matches || document.hidden || slides.length < 2) return;
    autoplayId = window.setInterval(() => applySlide((activeIndex + 1) % slides.length), autoplayDelay);
  };

  indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
      applySlide(index);
      startAutoplay();
    });
  });

  projectsProofCarousel.addEventListener('mouseenter', stopAutoplay);
  projectsProofCarousel.addEventListener('mouseleave', startAutoplay);
  projectsProofCarousel.addEventListener('focusin', stopAutoplay);
  projectsProofCarousel.addEventListener('focusout', startAutoplay);
  document.addEventListener('visibilitychange', () => document.hidden ? stopAutoplay() : startAutoplay());

  if (typeof reducedMotion.addEventListener === 'function') {
    reducedMotion.addEventListener('change', () => {
      if (reducedMotion.matches) stopAutoplay();
      else startAutoplay();
    });
  }

  applySlide(0);
  startAutoplay();
}

const projectsSwitcherApp = document.querySelector('[data-projects-switcher-app]');
if (projectsSwitcherApp) {
  const viewButtons = Array.from(document.querySelectorAll('[data-projects-view-btn]'));
  const views = Array.from(projectsSwitcherApp.querySelectorAll('[data-projects-view]'));

  const setProjectsView = (nextView, updateUrl = false) => {
    const validView = nextView === 'concepts' ? 'concepts' : 'completed';

    viewButtons.forEach((button) => {
      const isActive = button.dataset.view === validView;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    views.forEach((view) => {
      const isActive = view.dataset.projectsView === validView;
      view.hidden = !isActive;
    });

    if (updateUrl) {
      const hash = validView === 'concepts' ? '#concept-styles' : '#completed-projects';
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${hash}`);
    }
  };

  viewButtons.forEach((button) => {
    button.addEventListener('click', () => {
      setProjectsView(button.dataset.view || 'completed', true);
    });
  });

  window.addEventListener('hashchange', () => {
    setProjectsView(window.location.hash === '#concept-styles' ? 'concepts' : 'completed');
  });

  setProjectsView(window.location.hash === '#concept-styles' ? 'concepts' : 'completed');
}

const projectFilterButtons = Array.from(document.querySelectorAll('[data-project-filter]'));
if (projectFilterButtons.length) {
  const projectCards = Array.from(document.querySelectorAll('.projects-completed-card[data-project-type]'));
  const emptyState = document.querySelector('[data-project-filter-empty]');

  const setProjectFilter = (filter) => {
    let visibleCount = 0;

    projectFilterButtons.forEach((button) => {
      const isActive = button.dataset.projectFilter === filter;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    projectCards.forEach((card) => {
      const isVisible = filter === 'all' || card.dataset.projectType === filter;
      card.classList.toggle('is-filtered-out', !isVisible);
      card.classList.remove('is-filter-entering');
      if (isVisible) {
        visibleCount += 1;
        void card.offsetWidth;
        card.classList.add('is-filter-entering');
      }
    });

    if (emptyState) emptyState.hidden = visibleCount > 0;
  };

  projectFilterButtons.forEach((button) => {
    button.addEventListener('click', () => setProjectFilter(button.dataset.projectFilter || 'all'));
  });

  setProjectFilter('all');
}
