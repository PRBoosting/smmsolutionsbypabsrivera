const navButton = document.querySelector('.menu-button');
const nav = document.querySelector('nav');
navButton.addEventListener('click', () => { const open = nav.classList.toggle('open'); navButton.setAttribute('aria-expanded', open); });
document.querySelectorAll('nav a').forEach(link => link.addEventListener('click', () => nav.classList.remove('open')));

const modal = document.querySelector('.package-modal');
const modalImage = modal.querySelector('img');
document.querySelectorAll('[data-package]').forEach(button => button.addEventListener('click', () => {
  const name = button.dataset.package;
  modalImage.src = `assets/${name}.png`;
  modalImage.alt = `SMM Solutions ${button.closest('.service-card').querySelector('p').textContent} package list`;
  modal.showModal();
}));
modal.querySelector('.close-modal').addEventListener('click', () => modal.close());
modal.addEventListener('click', event => { if (event.target === modal) modal.close(); });
document.querySelector('#year').textContent = new Date().getFullYear();

const directoryData = {
  all: { label:'ALL PLATFORMS', title:'Popular services, clearly grouped.', description:'Select a platform to see the service types available and their usual delivery window.', services:[['Facebook','Followers · reacts · views','Usually 1–3 days'],['Instagram','Followers · likes · views','Usually 1–3 days'],['TikTok','Followers · likes · views','Usually 1–3 days'],['YouTube','Subscribers · watch hours · views','Usually 2–5 days'],['X / Twitter','Followers · likes · impressions','Minutes–hours']] },
  facebook: { label:'FACEBOOK SERVICES', title:'Choose your Facebook goal.', description:'Browse promo packages for followers, reactions, views, shares, and PH-based audience options.', services:[['Followers','Global or PH-based','Usually 1–3 days'],['Engagement','Reacts · comments · shares','Usually 1–2 days'],['Video views','Reels and video views','Usually 1–3 days'],['Pages','Page packages & handover','Usually 1–2 days']] },
  instagram: { label:'INSTAGRAM SERVICES', title:'Grow your Instagram content.', description:'Choose a promo package for followers, likes, reel views, story views, or saves.', services:[['Followers','Global audience','Usually 1–3 days'],['Likes','Hearts and post likes','Usually 1–3 days'],['Views','Reels, videos & stories','Usually 1–3 days'],['Saves','Post saves','Usually 1–3 days']] },
  tiktok: { label:'TIKTOK SERVICES', title:'Boost your TikTok reach.', description:'Choose followers, likes, video views, shares, or saves based on your campaign goal.', services:[['Followers','Global audience','Usually 1–3 days'],['Likes','Video likes','Usually 1–3 days'],['Views','Video views','Usually 1–3 days'],['Shares & saves','Video engagement','Usually 1–3 days']] },
  youtube: { label:'YOUTUBE SERVICES', title:'Support your YouTube launch.', description:'Browse subscribers, watch hours, likes, and video views, with delivery based on service and quantity.', services:[['Subscribers','Channel growth','Usually 2–5 days'],['Watch hours','Channel progress','Usually 2–5 days'],['Video views','Videos and Shorts','Usually 1–3 days'],['Likes','Video engagement','Usually 1–3 days']] },
  twitter: { label:'X / TWITTER SERVICES', title:'Choose your X / Twitter package.', description:'Browse followers, likes, and tweet views plus impressions.', services:[['Followers','500 to 100,000 followers','Minutes–hours'],['Likes','100 to 10,000 likes','Minutes–hours'],['Views + impressions','100K to 50M','Minutes–hours']] }
};
const filterButtons = document.querySelectorAll('[data-service-filter]');
const serviceCards = document.querySelectorAll('.service-card[data-platform]');
const directoryPlatform = document.querySelector('#directory-platform');
const directoryTitle = document.querySelector('#directory-title');
const directoryDescription = document.querySelector('#directory-description');
const directoryServices = document.querySelector('#directory-services');
function updateDirectory(platform) {
  const item = directoryData[platform];
  directoryPlatform.textContent = item.label;
  directoryTitle.textContent = item.title;
  directoryDescription.textContent = item.description;
  directoryServices.innerHTML = item.services.map(service => `<div class="directory-service"><b>${service[0]}</b><small>${service[1]} · ${service[2]}</small></div>`).join('');
}
filterButtons.forEach(button => button.addEventListener('click', () => {
  const platform = button.dataset.serviceFilter;
  filterButtons.forEach(item => { item.classList.toggle('active', item === button); item.setAttribute('aria-pressed', String(item === button)); });
  serviceCards.forEach(card => card.classList.toggle('is-filtered-out', platform !== 'all' && card.dataset.platform !== platform));
  updateDirectory(platform);
}));
filterButtons.forEach(button => button.setAttribute('aria-pressed', String(button.classList.contains('active'))));
updateDirectory('all');

const launcher = document.querySelector('.chat-launcher');
const chat = document.querySelector('.chat-widget');
const closeChat = document.querySelector('.chat-close');
const messages = document.querySelector('.chat-messages');
const chatForm = document.querySelector('.chat-form');
const chatInput = chatForm.querySelector('input');
function toggleChat(open) { chat.classList.toggle('open', open); chat.setAttribute('aria-hidden', !open); launcher.setAttribute('aria-expanded', open); if (open) chatInput.focus(); }
function addMessage(text, type) { const message = document.createElement('div'); message.className = `message ${type}`; message.textContent = text; messages.append(message); messages.scrollTop = messages.scrollHeight; }
function reply(question) {
  const text = question.toLowerCase();
  let answer = 'I can help with Facebook, Instagram, TikTok, YouTube, and X / Twitter services. Please message our Facebook page with the package you are interested in.';
  if (text.includes('order') || text.includes('avail')) answer = 'Choose a platform and package, then send the public link to your profile, account, post, or video. Never share passwords or login details.';
  if (text.includes('payment') || text.includes('pay')) answer = 'Payment details are confirmed safely in Facebook Messenger before an order is processed.';
  if (text.includes('price') || text.includes('package')) answer = 'View the promo cards in Services, or use the Quick Custom Quote for a regular-rate estimate.';
  if (text.includes('safe') || text.includes('legit') || text.includes('password')) answer = 'For boosting, we only ask for a public link to the profile, account, post, or video—never a password or login detail.';
  setTimeout(() => addMessage(answer, 'bot'), 280);
}
launcher.addEventListener('click', () => toggleChat(!chat.classList.contains('open')));
closeChat.addEventListener('click', () => toggleChat(false));
document.querySelectorAll('[data-question]').forEach(button => button.addEventListener('click', () => { addMessage(button.dataset.question, 'user'); reply(button.dataset.question); }));
chatForm.addEventListener('submit', event => { event.preventDefault(); const question = chatInput.value.trim(); if (!question) return; addMessage(question, 'user'); chatInput.value = ''; reply(question); });
