import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { getFunctions, httpsCallable } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-functions.js';
import { firebaseConfig } from './firebase-config.js';

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const functions = getFunctions(app, 'asia-southeast1');
const askAssistant = httpsCallable(functions, 'askSmmAssistant', { timeout: 35000 });

window.askSmmAssistant = async message => {
  const result = await askAssistant({ message: String(message || '').slice(0, 700) });
  const answer = String(result?.data?.answer || '').trim();
  if (!answer) throw new Error('No AI answer returned.');
  return answer;
};
