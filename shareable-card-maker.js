import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import { GoogleAuthProvider, getAuth, onAuthStateChanged, signInWithPopup } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';
import { addDoc, collection, getFirestore, serverTimestamp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';
import { firebaseConfig } from './firebase-config.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
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

function drawPreview() {
  const title = form.elements.title.value.trim() || 'Your card title';
  const description = form.elements.description.value.trim() || 'A short description goes here.';
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
  return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => { const image = new Image(); image.onload = () => { const ratio = Math.min(1200 / image.width, 630 / image.height, 1); const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(image.width * ratio)); c.height = Math.max(1, Math.round(image.height * ratio)); c.getContext('2d').drawImage(image, 0, 0, c.width, c.height); const result = c.toDataURL('image/jpeg', .72); if (result.length > 700000) reject(new Error('Please use a smaller image.')); else resolve(result); }; image.onerror = () => reject(new Error('That image could not be read.')); image.src = reader.result; }; reader.onerror = () => reject(new Error('That image could not be read.')); reader.readAsDataURL(file); });
}
signIn.addEventListener('click', () => signInWithPopup(auth, provider).catch(error => { status.textContent = `Sign-in could not be completed: ${error.message}`; }));
onAuthStateChanged(auth, user => { currentUser = user; publish.disabled = !user; if (user) { signIn.hidden = true; status.textContent = `Signed in as ${user.displayName || user.email}. You can publish cards.`; } });
form.elements.image.addEventListener('change', async event => { const file = event.target.files[0]; if (!file) return; message.textContent = 'Preparing image…'; try { imageData = await compressImage(file); drawPreview(); message.textContent = ''; } catch (error) { imageData = ''; message.textContent = error.message; } });
['title', 'description', 'destination'].forEach(name => form.elements[name].addEventListener('input', drawPreview));
form.addEventListener('submit', async event => { event.preventDefault(); if (!currentUser) return; if (!imageData) { message.textContent = 'Please add an image first.'; return; } let destination; try { destination = new URL(form.elements.destination.value).href; } catch { message.textContent = 'Please enter a valid destination link.'; return; } publish.disabled = true; message.textContent = 'Publishing your card…'; try { const doc = await addDoc(collection(db, 'shareCards'), { ownerUid: currentUser.uid, ownerName: currentUser.displayName || '', title: form.elements.title.value.trim(), description: form.elements.description.value.trim(), destination, imageData, clicks: 0, createdAt: serverTimestamp() }); const url = new URL('card.html', window.location.href); url.searchParams.set('id', doc.id); document.querySelector('#share-url').value = url.href; document.querySelector('#open-share-card').href = url.href; document.querySelector('#share-result').hidden = false; message.textContent = 'Your card is published.'; } catch (error) { message.textContent = `Could not publish your card: ${error.message}`; } finally { publish.disabled = false; } });
document.querySelector('#copy-share-url').addEventListener('click', async () => { const field = document.querySelector('#share-url'); try { await navigator.clipboard.writeText(field.value); } catch { field.select(); document.execCommand('copy'); } document.querySelector('#copy-share-url').textContent = 'Copied!'; });
drawPreview();
