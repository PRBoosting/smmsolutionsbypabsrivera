import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import { GoogleAuthProvider, getAuth, onAuthStateChanged, signInWithPopup } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';
import { getFunctions, httpsCallable } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-functions.js';
import { firebaseConfig } from './firebase-config.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app, 'asia-southeast1');
const createShareCard = httpsCallable(functions, 'createShareCard');
const uploadCardImage = httpsCallable(functions, 'uploadCardImage');
const provider = new GoogleAuthProvider();
const form = document.querySelector('#share-card-form');
const signIn = document.querySelector('#sign-in');
const status = document.querySelector('#account-status');
const publish = document.querySelector('#publish-card');
const message = document.querySelector('#publish-message');
const canvas = document.querySelector('#card-preview');
const context = canvas.getContext('2d');
let currentUser = null;
let imageData = '';
let selectedFile = null;

function isPremium() { return form.elements.tier.value === 'premium'; }
function setMessage(text) { message.textContent = text; }

function syncTier() {
  const premium = isPremium();
  const title = form.elements.title;
  const description = form.elements.description;
  title.disabled = !premium;
  description.disabled = !premium;
  title.required = premium;
  if (!premium) {
    title.value = '';
    description.value = '';
    title.placeholder = 'Premium cards can use a custom title';
    description.placeholder = 'Premium cards can use a custom description';
  } else {
    title.placeholder = 'What should people see?';
    description.placeholder = 'Short details for your card';
  }
  publish.textContent = premium ? 'Publish premium card →' : 'Publish free daily card →';
  drawPreview();
}

function drawPreview() {
  const title = isPremium() ? (form.elements.title.value.trim() || 'Your card title') : 'Shared link';
  const description = isPremium() ? (form.elements.description.value.trim() || 'A short description goes here.') : 'Open this shared link from SMM Solutions.';
  const destination = form.elements.destination.value.trim().replace(/^https?:\/\//, '') || 'your-link.com';
  context.fillStyle = '#071f4d'; context.fillRect(0, 0, 1200, 630);
  if (imageData) { const image = new Image(); image.onload = () => { context.drawImage(image, 0, 0, 540, 630); context.fillStyle = '#071f4daa'; context.fillRect(0, 0, 540, 630); drawText(title, description, destination); }; image.src = imageData; return; }
  const gradient = context.createLinearGradient(0, 0, 540, 630); gradient.addColorStop(0, '#2a9dff'); gradient.addColorStop(1, '#7040bb'); context.fillStyle = gradient; context.fillRect(0, 0, 540, 630); drawText(title, description, destination);
}

function drawText(title, description, destination) {
  context.fillStyle = '#e9f5ff'; context.font = '700 24px Arial'; context.fillText('SMM SOLUTIONS • LINK CARD', 600, 105);
  const wrap = (text, y, font, color, lines) => { context.font = font; context.fillStyle = color; let line = '', count = 0; text.split(/\s+/).forEach(word => { const next = `${line}${line ? ' ' : ''}${word}`; if (context.measureText(next).width > 500 && line && count < lines) { context.fillText(line, 600, y + count * 58); line = word; count++; } else line = next; }); if (count < lines) context.fillText(line, 600, y + count * 58); };
  wrap(title, 190, '700 52px Arial', '#fff', 2); wrap(description, 335, '400 25px Arial', '#c6dafa', 3);
  context.fillStyle = '#fff'; context.fillRect(600, 520, 380, 58); context.fillStyle = '#0c4f9e'; context.font = '700 22px Arial'; context.fillText(destination.slice(0, 30), 625, 558);
}

function compressImage(file) {
  return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => { const image = new Image(); image.onload = () => { const ratio = Math.min(1200 / image.width, 630 / image.height, 1); const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(image.width * ratio)); c.height = Math.max(1, Math.round(image.height * ratio)); c.getContext('2d').drawImage(image, 0, 0, c.width, c.height); c.toBlob(blob => blob ? resolve(blob) : reject(new Error('That image could not be prepared.')), 'image/jpeg', .78); }; image.onerror = () => reject(new Error('That image could not be read.')); image.src = reader.result; }; reader.onerror = () => reject(new Error('That image could not be read.')); reader.readAsDataURL(file); });
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => reject(new Error('That image could not be prepared.')); reader.readAsDataURL(blob); });
}

async function updateAccount(user) {
  try {
    const account = await getDoc(doc(db, 'cardUsers', user.uid));
    const balance = account.exists() ? Number(account.data().tokenBalance || 0) : 0;
    status.textContent = `Signed in as ${user.displayName || user.email}. Premium tokens: ${balance}. Your free daily card is protected by your account.`;
  } catch { status.textContent = `Signed in as ${user.displayName || user.email}.`; }
}

signIn.addEventListener('click', () => signInWithPopup(auth, provider).catch(error => { status.textContent = `Sign-in could not be completed: ${error.message}`; }));
onAuthStateChanged(auth, user => { currentUser = user; publish.disabled = !user; if (user) { signIn.hidden = true; updateAccount(user); } });
form.elements.image.addEventListener('change', async event => { selectedFile = event.target.files[0] || null; if (!selectedFile) return; if (selectedFile.size > 3 * 1024 * 1024) { selectedFile = null; setMessage('Please choose an image smaller than 3 MB.'); return; } setMessage('Preparing image…'); try { const blob = await compressImage(selectedFile); imageData = URL.createObjectURL(blob); drawPreview(); setMessage(''); } catch (error) { imageData = ''; setMessage(error.message); } });
['title', 'description', 'destination'].forEach(name => form.elements[name].addEventListener('input', drawPreview));
form.querySelectorAll('input[name="tier"]').forEach(input => input.addEventListener('change', syncTier));

form.addEventListener('submit', async event => {
  event.preventDefault();
  if (!currentUser) return;
  if (!selectedFile || !imageData) { setMessage('Please add an image first.'); return; }
  let destination; try { destination = new URL(form.elements.destination.value).href; } catch { setMessage('Please enter a valid destination link.'); return; }
  publish.disabled = true; setMessage('Publishing your protected card…');
  try {
    const image = await compressImage(selectedFile);
    const uploaded = await uploadCardImage({ dataUrl: await blobToDataUrl(image) });
    const { imagePath, imageUrl } = uploaded.data;
    const result = await createShareCard({ destination, imageUrl, imagePath, title: form.elements.title.value.trim(), description: form.elements.description.value.trim(), tier: isPremium() ? 'premium' : 'free' });
    const url = new URL(`/c/${result.data.id}`, window.location.origin);
    document.querySelector('#share-url').value = url.href;
    document.querySelector('#open-share-card').href = url.href;
    document.querySelector('#share-result').hidden = false;
    setMessage(`Your ${result.data.tier} card is published safely.`);
    updateAccount(currentUser);
  } catch (error) {
    const code = String(error.code || '');
    if (code.includes('resource-exhausted')) setMessage(error.message || 'Today’s free-card limit has been reached.');
    else if (code.includes('failed-precondition')) setMessage('You need a premium token. Message SMM Solutions after payment to add tokens.');
    else if (code.includes('unavailable') || code.includes('not-found')) setMessage('The protected preview service is not active yet. It will work after the Firebase server setup is published.');
    else setMessage(`Could not publish your card: ${error.message}`);
  } finally { publish.disabled = false; }
});

document.querySelector('#copy-share-url').addEventListener('click', async () => { const field = document.querySelector('#share-url'); try { await navigator.clipboard.writeText(field.value); } catch { field.select(); document.execCommand('copy'); } document.querySelector('#copy-share-url').textContent = 'Copied!'; });
syncTier();
