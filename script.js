// ---------- Theme toggle (persisted) ----------
(function () {
  const root = document.documentElement;
  const toggle = document.getElementById('theme-toggle');
  const saved = localStorage.getItem('theme');
  if (saved === 'light' || saved === 'dark') {
    root.setAttribute('data-theme', saved);
  }
  toggle.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });
})();

// ---------- Footer year ----------
document.getElementById('year').textContent = new Date().getFullYear();

// ---------- Dynamic terminal: typewriter cycling through commands ----------
(function () {
  const cmdEl = document.getElementById('term-cmd');
  const outEl = document.getElementById('term-out');
  if (!cmdEl || !outEl) return;

  const sequence = [
    {
      cmd: 'whoami',
      out: 'riyansh sachdev — software engineer, ML/AI developer.'
    },
    {
      cmd: 'cat about.md',
      out: 'incoming MS CS @ NYU Tandon · currently building offline RAG & Go market-data backends.'
    },
    {
      cmd: 'ls ~/interests',
      out: 'ai-ml-systems/  distributed-backends/  coffee/  claude/'
    },
    {
      cmd: 'echo $STATUS',
      out: '<span class="ok">●</span> open to research collabs & SWE/ML/AI internship roles'
    },
    {
      cmd: 'git log --oneline -1',
      out: 'feat: shipped FinRAG → 100% offline doc Q&A with zero data egress'
    },
    {
      cmd: 'fortune',
      out: '"build the boring infra. the magic only shows up after."'
    }
  ];

  const TYPE_SPEED = 90;
  const ERASE_SPEED = 90;
  const HOLD_AFTER_OUT = 3600;
  const HOLD_BEFORE_TYPE = 500;

  let seqIdx = 0;

  function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

  async function typeText(el, text, speed) {
    for (let i = 0; i < text.length; i++) {
      el.textContent = text.slice(0, i + 1);
      await sleep(speed + Math.random() * 35);
    }
  }
  async function eraseText(el, speed) {
    const t = el.textContent;
    for (let i = t.length; i > 0; i--) {
      el.textContent = t.slice(0, i - 1);
      await sleep(speed);
    }
  }

  async function loop() {
    while (true) {
      const step = sequence[seqIdx];
      await sleep(HOLD_BEFORE_TYPE);
      await typeText(cmdEl, step.cmd, TYPE_SPEED);
      await sleep(280);
      outEl.innerHTML = step.out;
      await sleep(HOLD_AFTER_OUT);
      // erase output then command
      outEl.innerHTML = '';
      await eraseText(cmdEl, ERASE_SPEED);
      seqIdx = (seqIdx + 1) % sequence.length;
    }
  }

  loop();
})();

// ---------- Photo stack (shuffling deck) ----------
(function () {
  const stack = document.getElementById('photo-stack');
  const shuffleBtn = document.getElementById('stack-shuffle');
  if (!stack) return;

  const imagePaths = (stack.dataset.images || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (!imagePaths.length) return;

  // Preload + filter to only images that exist
  function preload(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(src);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }

  Promise.all(imagePaths.map(preload)).then((results) => {
    const available = results.filter(Boolean);
    if (!available.length) return; // keep placeholder visible

    // Remove placeholder
    const ph = stack.querySelector('.stack-placeholder');
    if (ph) ph.remove();

    // Build cards (last in DOM = on top visually)
    available.forEach((src, idx) => {
      const card = document.createElement('div');
      card.className = 'stack-card';
      const img = document.createElement('img');
      img.src = src;
      img.alt = 'Riyansh Sachdev';
      card.appendChild(img);
      stack.appendChild(card);
    });

    layout();

    function layout() {
      const cards = Array.from(stack.querySelectorAll('.stack-card'));
      // bottom-up offsets: cards behind are scaled down and slightly rotated
      const n = cards.length;
      cards.forEach((c, i) => {
        // i = 0 is bottom in DOM order; top is last
        const depth = n - 1 - i; // 0 for top
        const offsetY = depth * -8; // shift up
        const offsetX = depth * 6;  // shift right
        const rotate = depth * -3;  // slight tilt
        const scale = 1 - depth * 0.04;
        c.style.zIndex = String(100 - depth);
        c.style.transform = `translate(${offsetX}px, ${offsetY}px) rotate(${rotate}deg) scale(${scale})`;
        c.style.opacity = depth > 3 ? '0' : String(1 - depth * 0.06);
      });
    }

    let busy = false;
    function shuffle() {
      if (busy) return;
      const cards = Array.from(stack.querySelectorAll('.stack-card'));
      if (cards.length < 2) return;
      busy = true;
      const top = cards[cards.length - 1];
      top.classList.add('is-flying');
      setTimeout(() => {
        // Move top card to the bottom of the stack (becomes back card)
        top.classList.remove('is-flying');
        top.style.transition = 'none';
        stack.insertBefore(top, stack.firstChild);
        // Force reflow then re-enable transitions
        void top.offsetWidth;
        top.style.transition = '';
        layout();
        busy = false;
      }, 600);
    }

    stack.addEventListener('click', shuffle);
    if (shuffleBtn) shuffleBtn.addEventListener('click', (e) => { e.stopPropagation(); shuffle(); });

    // Auto-shuffle every 4s if more than 1 image
    if (available.length > 1) {
      setInterval(shuffle, 4000);
    }
  });
})();

// ---------- Reveal-on-scroll for sections ----------
(function () {
  const els = document.querySelectorAll('.section-inner');
  if (!('IntersectionObserver' in window) || !els.length) return;
  els.forEach((el) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 600ms ease, transform 600ms ease';
  });
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.style.opacity = '1';
          e.target.style.transform = 'translateY(0)';
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -60px 0px' }
  );
  els.forEach((el) => io.observe(el));
})();
