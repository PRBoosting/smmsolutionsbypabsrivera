(() => {
  const fastPlatforms = ['facebook', 'instagram', 'tiktok'];
  const updateCardTimes = () => {
    document.querySelectorAll('.service-card[data-platform]').forEach(card => {
      if (!fastPlatforms.includes(card.dataset.platform)) return;
      const estimate = card.querySelector('.delivery-estimate');
      if (!estimate) return;
      estimate.textContent = estimate.textContent.toLowerCase().includes('handover')
        ? 'Estimated handover: Minutes–hours'
        : 'Estimated delivery: Minutes–hours';
    });
  };

  const updateDirectoryTimes = () => {
    const platform = document.querySelector('#directory-platform')?.textContent || '';
    if (platform === 'YOUTUBE SERVICES') return;
    const items = [...document.querySelectorAll('#directory-services .directory-service small')];
    const fastItems = platform === 'ALL PLATFORMS' ? items.slice(0, 3) : items;
    fastItems.forEach(item => {
      item.textContent = item.textContent.replace(/Usually .+$/, 'Minutes-hours');
    });
  };

  updateCardTimes();
  updateDirectoryTimes();
  document.querySelectorAll('[data-service-filter]').forEach(button => button.addEventListener('click', () => {
    updateCardTimes();
    updateDirectoryTimes();
  }));
})();
