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
