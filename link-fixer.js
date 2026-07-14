(() => {
  const tools = document.querySelector('.customer-tools');
  const faq = document.querySelector('.faq');
  if (!tools || !faq) return;

  const callout = document.createElement('section');
  callout.className = 'link-fixer-callout';
  callout.setAttribute('aria-label', 'Free link fixer');
  callout.innerHTML = '<span>NEW FREE TOOL</span><p>Have a social link for a boost?</p><button type="button">Clean and check your link <b>→</b></button>';
  tools.insertAdjacentElement('afterend', callout);

  const dialog = document.createElement('dialog');
  dialog.className = 'utility-modal link-fixer-modal';
  dialog.innerHTML = '<button class="close-utility" aria-label="Close link fixer">×</button><p class="eyebrow">FREE LINK FIXER</p><h2>Clean your boost link.</h2><p>Paste a Facebook, Instagram, TikTok, YouTube, or website link. We fix the format and remove common tracking parts in your browser. Nothing is saved or sent.</p><form class="link-fixer-form"><label>Your link <input name="link" type="text" autocomplete="url" placeholder="Paste your profile, post, or video link" required /></label><button class="button button-primary" type="submit">Fix my link <span>→</span></button></form><div class="link-fixer-result" hidden><p class="link-status"></p><label>Clean link <input class="clean-link" type="text" readonly /></label><button class="copy-clean-link" type="button">Copy clean link</button><p class="link-note"></p></div>';
  document.body.append(dialog);

  const form = dialog.querySelector('form');
  const resultBox = dialog.querySelector('.link-fixer-result');
  const output = dialog.querySelector('.clean-link');
  const status = dialog.querySelector('.link-status');
  const note = dialog.querySelector('.link-note');
  const copyButton = dialog.querySelector('.copy-clean-link');
  const shortenButton = document.createElement('button');
  const shortResult = document.createElement('div');
  const shortLabel = document.createElement('label');
  const shortLink = document.createElement('input');
  const copyShortButton = document.createElement('button');
  dialog.querySelector('h2').textContent = 'Clean or shorten your link.';
  dialog.querySelector('h2').nextElementSibling.textContent = 'Cleaning happens in your browser. Shortening sends only the link you choose to the free is.gd service.';
  shortenButton.className = 'shorten-clean-link';
  shortenButton.type = 'button';
  shortenButton.textContent = 'Shorten this link for free';
  shortResult.className = 'short-link-result';
  shortResult.hidden = true;
  shortLabel.textContent = 'Short link';
  shortLink.className = 'short-link';
  shortLink.type = 'text';
  shortLink.readOnly = true;
  copyShortButton.className = 'copy-short-link';
  copyShortButton.type = 'button';
  copyShortButton.textContent = 'Copy short link';
  shortLabel.append(shortLink);
  shortResult.append(shortLabel, copyShortButton);
  resultBox.insertBefore(shortenButton, note);
  resultBox.insertBefore(shortResult, note);

  function fixLink(value) {
    let prepared = value.trim().replace(/[“”"']/g, '').replace(/\s+/g, '');
    if (!prepared) throw new Error('Please paste a link first.');
    if (!/^[a-z][a-z\d+.-]*:\/\//i.test(prepared)) prepared = `https://${prepared}`;
    const url = new URL(prepared);
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Please use a regular website or social-media link.');
    const aliases = { 'm.facebook.com': 'www.facebook.com', 'web.facebook.com': 'www.facebook.com', 'fb.com': 'www.facebook.com', 'm.instagram.com': 'www.instagram.com', 'm.tiktok.com': 'www.tiktok.com' };
    url.hostname = aliases[url.hostname.toLowerCase()] || url.hostname.toLowerCase();
    [...url.searchParams.keys()].forEach(key => { if (/^(utm_|fbclid$|gclid$|igsh|igshid|si$|mibextid$|ref$|source$)/i.test(key)) url.searchParams.delete(key); });
    const host = url.hostname;
    const platform = host.includes('facebook.com') ? 'Facebook' : host.includes('instagram.com') ? 'Instagram' : host.includes('tiktok.com') ? 'TikTok' : host.includes('youtube.com') ? 'YouTube' : 'Website';
    const isShareLink = host.includes('facebook.com') && /^\/share/i.test(url.pathname);
    return { link: url.toString(), status: `${platform} link cleaned and ready to copy.`, note: isShareLink ? 'This looks like a Facebook share link. For boosting, use the direct profile, page, post, or video link whenever possible.' : 'Check that this opens the exact profile, post, account, or video you want to use before ordering.' };
  }

  callout.querySelector('button').addEventListener('click', () => dialog.showModal());
  dialog.querySelector('.close-utility').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  form.addEventListener('submit', event => {
    event.preventDefault();
    try { const fixed = fixLink(form.elements.link.value); output.value = fixed.link; status.textContent = fixed.status; note.textContent = fixed.note; }
    catch (error) { output.value = ''; status.textContent = error.message; note.textContent = 'Try copying the full link again from the social-media app or browser.'; }
    resultBox.hidden = false;
    shortResult.hidden = true;
    shortLink.value = '';
  });
  copyButton.addEventListener('click', async () => {
    if (!output.value) return;
    try { await navigator.clipboard.writeText(output.value); } catch { output.select(); document.execCommand('copy'); }
    copyButton.textContent = 'Copied!';
    window.setTimeout(() => { copyButton.textContent = 'Copy clean link'; }, 1800);
  });

  function shortenWithIsGd(url) {
    return new Promise((resolve, reject) => {
      const callback = `isgd_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const script = document.createElement('script');
      const timeout = window.setTimeout(() => finish(new Error('The shortening service took too long. Please try again.')), 12000);
      function finish(error, data) {
        window.clearTimeout(timeout);
        delete window[callback];
        script.remove();
        if (error) reject(error); else resolve(data);
      }
      window[callback] = data => data?.shorturl ? finish(null, data.shorturl) : finish(new Error(data?.errormessage || 'The shortening service could not create a link.'));
      script.src = `https://is.gd/create.php?format=json&callback=${callback}&url=${encodeURIComponent(url)}`;
      script.onerror = () => finish(new Error('The shortening service is unavailable right now.'));
      document.head.append(script);
    });
  }

  shortenButton.addEventListener('click', async () => {
    if (!output.value) return;
    shortenButton.disabled = true;
    shortenButton.textContent = 'Creating short link…';
    try {
      shortLink.value = await shortenWithIsGd(output.value);
      shortResult.hidden = false;
    } catch (error) {
      note.textContent = error.message;
    } finally {
      shortenButton.disabled = false;
      shortenButton.textContent = 'Shorten this link for free';
    }
  });

  copyShortButton.addEventListener('click', async () => {
    if (!shortLink.value) return;
    try { await navigator.clipboard.writeText(shortLink.value); } catch { shortLink.select(); document.execCommand('copy'); }
    copyShortButton.textContent = 'Copied!';
    window.setTimeout(() => { copyShortButton.textContent = 'Copy short link'; }, 1800);
  });
})();
