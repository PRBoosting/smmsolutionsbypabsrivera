import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut
} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';
import {
  addDoc,
  collection,
  getDocs,
  getFirestore,
  query,
  serverTimestamp,
  where
} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';
import { firebaseConfig } from './firebase-config.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

const grid = document.querySelector('#listing-grid');
const search = document.querySelector('#listing-search');
const category = document.querySelector('#listing-category');
const listingType = document.querySelector('#listing-type');
const signInButton = document.querySelector('#sign-in-button');
const accountMenu = document.querySelector('#account-menu');
const accountName = document.querySelector('#account-name');
const signOutButton = document.querySelector('#sign-out-button');
const postButtons = document.querySelectorAll('.open-post-form');
const modal = document.querySelector('#post-listing-modal');
const closeModalButton = document.querySelector('#close-listing-modal');
const listingForm = document.querySelector('#firebase-listing-form');
const formMessage = document.querySelector('#form-message');

let currentUser = null;
let listings = [];

const money = value => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(Number(value) || 0);

function safeImage(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? parsed.href : '';
  } catch {
    return '';
  }
}

function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function render() {
  const term = search.value.trim().toLowerCase();
  const selectedCategory = category.value;
  const selectedType = listingType.value;
  const visible = listings.filter(item => {
    const text = [item.title, item.description, item.category, item.location, item.type].join(' ').toLowerCase();
    return (!term || text.includes(term))
      && (selectedCategory === 'all' || item.category === selectedCategory)
      && (selectedType === 'all' || item.type === selectedType);
  });

  grid.replaceChildren();
  if (!visible.length) {
    const empty = makeElement('div', 'listing-empty');
    empty.append(makeElement('b', '', 'No approved listings found.'), makeElement('span', '', 'Try another search, or be the first to post one.'));
    grid.append(empty);
    return;
  }

  visible.forEach(item => {
    const card = makeElement('article', 'listing-card');
    const imageBox = makeElement('div', 'listing-image');
    const image = safeImage(item.image);
    if (image) {
      const picture = document.createElement('img');
      picture.src = image;
      picture.alt = item.title || 'Marketplace listing';
      picture.loading = 'lazy';
      imageBox.append(picture);
    } else imageBox.append(makeElement('span', '', 'No photo provided'));

    const body = makeElement('div', 'listing-body');
    body.append(
      makeElement('span', 'listing-category', `${item.type || 'Buy & Sell'} · ${item.category || 'Other'}`),
      makeElement('h3', '', item.title || 'Untitled listing'),
      makeElement('div', 'listing-price', item.price ? money(item.price) : 'Price on request'),
      makeElement('div', 'listing-meta', item.location || 'Location not specified'),
      makeElement('p', 'listing-description', item.description || '')
    );
    const contact = document.createElement('a');
    contact.className = 'button button-primary';
    contact.target = '_blank';
    contact.rel = 'noreferrer';
    contact.href = safeImage(item.contact) || 'https://www.facebook.com/smmsolutionsv2/';
    contact.textContent = 'Contact poster →';
    body.append(contact);
    card.append(imageBox, body);
    grid.append(card);
  });
}

async function loadListings() {
  grid.innerHTML = '<div class="listing-empty"><b>Loading approved listings…</b><span>Please wait a moment.</span></div>';
  try {
    const approved = await getDocs(query(collection(db, 'marketplaceListings'), where('status', '==', 'approved')));
    listings = approved.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    render();
  } catch (error) {
    console.error(error);
    grid.innerHTML = '<div class="listing-empty"><b>The marketplace is being prepared.</b><span>Please return soon or message SMM Solutions for help.</span></div>';
  }
}

function openForm() {
  if (!currentUser) {
    signInWithPopup(auth, provider).catch(error => alert(`Sign-in could not be completed: ${error.message}`));
    return;
  }
  formMessage.textContent = '';
  modal.hidden = false;
  document.body.classList.add('modal-open');
  document.querySelector('#listing-title').focus();
}

function closeForm() {
  modal.hidden = true;
  document.body.classList.remove('modal-open');
}

onAuthStateChanged(auth, user => {
  currentUser = user;
  signInButton.hidden = Boolean(user);
  accountMenu.hidden = !user;
  if (user) accountName.textContent = user.displayName || user.email || 'My account';
});

signInButton.addEventListener('click', () => signInWithPopup(auth, provider).catch(error => alert(`Sign-in could not be completed: ${error.message}`)));
signOutButton.addEventListener('click', () => signOut(auth));
postButtons.forEach(button => button.addEventListener('click', event => { event.preventDefault(); openForm(); }));
closeModalButton.addEventListener('click', closeForm);
modal.addEventListener('click', event => { if (event.target === modal) closeForm(); });

listingForm.addEventListener('submit', async event => {
  event.preventDefault();
  if (!currentUser) return openForm();
  const submitButton = listingForm.querySelector('button[type="submit"]');
  const data = new FormData(listingForm);
  const price = data.get('price').trim();
  formMessage.textContent = 'Sending your listing for review…';
  submitButton.disabled = true;
  try {
    await addDoc(collection(db, 'marketplaceListings'), {
      ownerUid: currentUser.uid,
      ownerName: currentUser.displayName || '',
      ownerEmail: currentUser.email || '',
      contact: data.get('contact').trim(),
      type: data.get('type'),
      title: data.get('title').trim(),
      category: data.get('category'),
      price: price ? Number(price) : 0,
      condition: data.get('condition'),
      description: data.get('description').trim(),
      location: data.get('location').trim(),
      image: data.get('image').trim(),
      status: 'pending',
      createdAt: serverTimestamp()
    });
    listingForm.reset();
    formMessage.textContent = 'Thanks! Your listing was sent for review. It will appear once approved.';
  } catch (error) {
    console.error(error);
    formMessage.textContent = 'Your listing could not be sent yet. Please try again.';
  } finally {
    submitButton.disabled = false;
  }
});

search.addEventListener('input', render);
category.addEventListener('change', render);
listingType.addEventListener('change', render);
document.querySelector('#year').textContent = new Date().getFullYear();
loadListings();
