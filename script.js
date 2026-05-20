// Theme toggle with localStorage persistence
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

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Pinned-ish GitHub repos: pull recent public repos and show top 4 by stars/recency
(async function () {
  const container = document.getElementById('gh-repos');
  if (!container) return;
  try {
    const res = await fetch(
      'https://api.github.com/users/riyansh100/repos?per_page=100&sort=updated'
    );
    if (!res.ok) throw new Error('GitHub API error');
    const repos = await res.json();
    const top = repos
      .filter((r) => !r.fork && !r.archived)
      .sort((a, b) => (b.stargazers_count - a.stargazers_count) || (new Date(b.pushed_at) - new Date(a.pushed_at)))
      .slice(0, 4);

    if (!top.length) {
      container.innerHTML = '<p class="gh-loading">No public repos yet.</p>';
      return;
    }

    container.innerHTML = top
      .map(
        (r) => `
        <article class="gh-repo">
          <h4><a href="${r.html_url}" target="_blank" rel="noopener">${r.name}</a></h4>
          <p>${r.description ? escapeHtml(r.description) : 'No description.'}</p>
          <div class="gh-meta">
            ${r.language ? `<span>${escapeHtml(r.language)}</span>` : ''}
            <span>★ ${r.stargazers_count}</span>
            <span>Updated ${formatDate(r.pushed_at)}</span>
          </div>
        </article>
      `
      )
      .join('');
  } catch (e) {
    container.innerHTML = '<p class="gh-loading">Couldn\'t load repos right now — visit <a href="https://github.com/riyansh100" target="_blank" rel="noopener">github.com/riyansh100</a>.</p>';
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }
  function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }
})();
