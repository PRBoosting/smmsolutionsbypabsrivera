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

  updateCardTimes();
  document.querySelectorAll('[data-service-filter]').forEach(button => button.addEventListener('click', updateCardTimes));
})();
