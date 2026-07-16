import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';
import { getFunctions, httpsCallable } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-functions.js';
import { firebaseConfig } from './firebase-config.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const functions = getFunctions(app, 'asia-southeast1');
const provider = new GoogleAuthProvider();
const signInButtons = [document.querySelector('#vip-sign-in'), document.querySelector('#vip-sign-in-panel')];
const signOutButton = document.querySelector('#vip-sign-out');
const accountMenu = document.querySelector('#vip-account-menu');
const accountName = document.querySelector('#vip-account-name');
const signedOut = document.querySelector('#vip-signed-out');
const member = document.querySelector('#vip-member');
const statusTitle = document.querySelector('#vip-status-title');
const statusCopy = document.querySelector('#vip-status-copy');
const statusBadge = document.querySelector('#vip-status-badge');
const benefits = document.querySelector('#vip-benefits');
const modal = document.querySelector('#application-modal');
const openApplication = document.querySelector('#open-application');
const closeApplication = document.querySelector('#close-application');
const form = document.querySelector('#reseller-application-form');
const message = document.querySelector('#application-message');
let user = null;

function openModal() { message.textContent = ''; modal.hidden = false; document.body.style.overflow = 'hidden'; }
function closeModal() { modal.hidden = true; document.body.style.overflow = ''; }
function signIn() { signInWithPopup(auth, provider).catch(error => alert(`Sign-in could not be completed: ${error.message}`)); }
function setStatus(data) {
  const status = data.status || 'not_applied';
  const copy = {
    not_applied: ['Ready to apply?', 'Complete the short application. Your details will be reviewed before any reseller access is given.', 'Not applied'],
    application_pending: ['Application under review', 'Your application was received. SMM Solutions will check your seller profile and contact you if needed.', 'Under review'],
    trial: ['Trial reseller active', 'Complete paid orders with a clean record to qualify for full VIP access.', 'Trial partner'],
    verified: ['VIP reseller active', 'Your account is verified. Ask SMM Solutions for the latest reseller rate list and place orders using this account.', 'VIP verified'],
    rejected: ['Application not approved', 'You may message SMM Solutions if you need clarification before applying again.', 'Not approved'],
    suspended: ['Reseller access paused', 'Please contact SMM Solutions for a review of your account.', 'Paused']
  }[status] || ['Checking your access…', 'Please wait a moment.', 'Checking'];
  statusTitle.textContent = copy[0]; statusCopy.textContent = copy[1]; statusBadge.textContent = copy[2];
  benefits.hidden = status !== 'verified';
  openApplication.hidden = ['application_pending', 'trial', 'verified', 'suspended'].includes(status);
  openApplication.textContent = status === 'rejected' ? 'Apply again →' : 'Apply now →';
}

async function loadDashboard() {
  try { const result = await httpsCallable(functions, 'getResellerDashboard')(); setStatus(result.data); }
  catch (error) { console.error(error); setStatus({}); statusCopy.textContent = 'Your status could not be loaded yet. Please refresh and try again.'; }
}

onAuthStateChanged(auth, currentUser => {
  user = currentUser; signInButtons.forEach(button => { button.hidden = Boolean(user); }); accountMenu.hidden = !user; signedOut.hidden = Boolean(user); member.hidden = !user;
  if (user) { accountName.textContent = user.displayName || user.email || 'My account'; loadDashboard(); }
});

signInButtons.forEach(button => button.addEventListener('click', signIn));
signOutButton.addEventListener('click', () => signOut(auth));
openApplication.addEventListener('click', () => { if (user) openModal(); else signIn(); });
closeApplication.addEventListener('click', closeModal);
modal.addEventListener('click', event => { if (event.target === modal) closeModal(); });
form.addEventListener('submit', async event => {
  event.preventDefault(); if (!user) return signIn();
  const button = form.querySelector('button[type="submit"]'); const data = Object.fromEntries(new FormData(form).entries());
  button.disabled = true; message.textContent = 'Sending your application…';
  try { await httpsCallable(functions, 'submitResellerApplication')(data); message.textContent = 'Application received. Thank you!'; form.reset(); await loadDashboard(); setTimeout(closeModal, 1000); }
  catch (error) { console.error(error); message.textContent = error.message || 'We could not send your application yet. Please try again.'; }
  finally { button.disabled = false; }
});
document.querySelector('#year').textContent = new Date().getFullYear();
