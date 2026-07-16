import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';
import { getFunctions, httpsCallable } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-functions.js';
import { firebaseConfig } from './firebase-config.js';

const app = initializeApp(firebaseConfig); const auth = getAuth(app); const functions = getFunctions(app, 'asia-southeast1'); const provider = new GoogleAuthProvider();
const signIn = document.querySelector('#admin-sign-in'); const list = document.querySelector('#admin-list'); const message = document.querySelector('#admin-message');
function safeLink(value) { try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : ''; } catch { return ''; } }
function make(tag, text, className) { const node = document.createElement(tag); if (text !== undefined) node.textContent = text; if (className) node.className = className; return node; }
function render(applications) {
  list.replaceChildren(); if (!applications.length) { const empty = make('div', undefined, 'admin-empty'); empty.append(make('b', 'No reseller applications yet.'), make('span', 'New applications will appear here after users submit the VIP form.')); list.append(empty); return; }
  applications.forEach(application => {
    const card = make('article', undefined, 'admin-card'); const details = make('div'); details.append(make('h2', application.businessName || 'Unnamed seller'), make('p', `Applicant: ${application.applicantName || application.applicantEmail || 'Unknown'}`, 'admin-meta'), make('p', `Phone: ${application.phone || 'Not provided'}`, 'admin-meta'));
    const link = safeLink(application.sellingPage); if (link) { const page = make('a', link, 'admin-contact'); page.href = link; page.target = '_blank'; page.rel = 'noreferrer'; details.append(page); }
    const facts = make('div', undefined, 'admin-facts'); [application.serviceFocus, application.monthlyVolume, `Current: ${application.status || 'application_pending'}`].filter(Boolean).forEach(value => facts.append(make('span', value))); details.append(facts);
    const review = make('div', undefined, 'admin-review'); const statusLabel = make('label', 'Decision'); const status = document.createElement('select'); ['application_pending', 'trial', 'verified', 'rejected', 'suspended'].forEach(value => { const option = document.createElement('option'); option.value = value; option.textContent = value.replaceAll('_', ' '); option.selected = value === application.status; status.append(option); }); statusLabel.append(status);
    const noteLabel = make('label', 'Private note'); const note = document.createElement('textarea'); note.placeholder = 'Example: Verified page; trial until 3 paid orders.'; note.value = application.adminNote || ''; noteLabel.append(note); const save = make('button', 'Save decision');
    save.addEventListener('click', async () => { save.disabled = true; save.textContent = 'Saving…'; try { await httpsCallable(functions, 'reviewResellerApplication')({ uid: application.applicantUid, decision: status.value, note: note.value.trim() }); message.textContent = 'Decision saved.'; await load(); } catch (error) { console.error(error); message.textContent = error.message || 'Could not save the decision.'; save.disabled = false; save.textContent = 'Save decision'; } }); review.append(statusLabel, noteLabel, save); card.append(details, review); list.append(card);
  });
}
async function load() { try { const result = await httpsCallable(functions, 'getResellerApplications')(); render(result.data.applications || []); } catch (error) { console.error(error); list.innerHTML = '<div class="admin-empty"><b>This page is for the SMM Solutions admin account only.</b><span>Sign in using smmsolutionsbypabsrivera@gmail.com, then refresh.</span></div>'; message.textContent = ''; } }
onAuthStateChanged(auth, user => { signIn.hidden = Boolean(user); if (user) load(); }); signIn.addEventListener('click', () => signInWithPopup(auth, provider).catch(error => message.textContent = error.message));
