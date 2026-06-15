// Tab switching
const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;

    tabBtns.forEach(b => b.classList.remove('active'));
    tabPanels.forEach(p => p.classList.remove('active'));

    btn.classList.add('active');
    document.getElementById('tab-' + target).classList.add('active');

    // Scroll to top of content smoothly
    document.querySelector('.main-content').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// Animate bars on load and on tab switch
function animateBars() {
  document.querySelectorAll('.bar-fill').forEach(bar => {
    const target = bar.style.width;
    bar.style.width = '0%';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        bar.style.width = target;
      });
    });
  });
}

animateBars();

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    setTimeout(animateBars, 50);
  });
});
