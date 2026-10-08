const grid = document.querySelector('#game-grid');
const status = document.querySelector('#catalog-status');
let games = [];
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const revealSelector = '.intro-line, .home-hero, .section-head, .video-card, .studio-section, .contact-band, .game-card';
let revealObserver;
function showReveal(element) {
  element.classList.add('is-visible');
  revealObserver?.unobserve(element);
}
function observeReveals(scope = document) {
  if (!revealObserver || motionPreference.matches) return;
  scope.querySelectorAll(revealSelector).forEach(element => {
    if (element.classList.contains('is-visible')) return;
    element.classList.add('reveal');
    revealObserver.observe(element);
  });
}
function configureReveals() {
  revealObserver?.disconnect();
  revealObserver = undefined;
  document.documentElement.classList.remove('reveal-ready');
  if (motionPreference.matches || !('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach(showReveal);
    return;
  }
  try {
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) showReveal(entry.target); });
    }, { threshold: 0, rootMargin: '0px 0px -24px 0px' });
    observeReveals();
    document.documentElement.classList.add('reveal-ready');
  } catch {
    document.querySelectorAll('.reveal').forEach(showReveal);
  }
}
configureReveals();
if (motionPreference.addEventListener) motionPreference.addEventListener('change', configureReveals);
else motionPreference.addListener?.(configureReveals);
document.addEventListener('focusin', event => {
  const element = event.target.closest('.reveal');
  if (element) showReveal(element);
});
let refreshScrollProgress = () => {};
const progress = document.querySelector('.scroll-progress, #scroll-progress');
if (progress) {
  let scheduled = false;
  const updateProgress = () => {
    const distance = document.documentElement.scrollHeight - window.innerHeight;
    const fraction = distance > 0 ? Math.min(1, Math.max(0, window.scrollY / distance)) : 0;
    document.documentElement.style.setProperty('--scroll-progress', fraction);
    scheduled = false;
  };
  const scheduleProgress = () => {
    if (!scheduled) { scheduled = true; requestAnimationFrame(updateProgress); }
  };
  refreshScrollProgress = scheduleProgress;
  window.addEventListener('scroll', scheduleProgress, { passive: true });
  window.addEventListener('resize', scheduleProgress);
  window.addEventListener('load', scheduleProgress, { once: true });
  updateProgress();
}

function render(filter = 'all') {
  grid.querySelectorAll('.reveal').forEach(element => revealObserver?.unobserve(element));
  grid.replaceChildren();
  const selected = games.filter(game => filter === 'all' || game.status === filter);
  for (const game of selected) {
    const card = document.createElement('article');
    card.className = 'game-card';
    card.style.setProperty('--accent', game.accent);
    const art = document.createElement('a');
    art.className = 'card-art'; art.href = `/${game.slug}/`; art.tabIndex = -1; art.setAttribute('aria-hidden', 'true');
    const image = document.createElement('img');
    image.src = game.image; image.alt = ''; image.loading = 'lazy'; image.width = 800; image.height = 450;
    art.append(image);
    const body = document.createElement('div'); body.className = 'card-body';
    const top = document.createElement('div'); top.className = 'card-top';
    const genre = document.createElement('span'); genre.className = 'eyebrow'; genre.textContent = game.genre;
    const pill = document.createElement('span'); pill.className = `pill ${game.playUrl ? 'live' : 'soon'}`; pill.textContent = game.status;
    top.append(genre, pill);
    const title = document.createElement('h3'); title.textContent = game.name;
    const desc = document.createElement('p'); desc.textContent = game.description;
    const link = document.createElement('a'); link.className = 'card-link'; link.href = `/${game.slug}/`; link.textContent = 'Explore game →'; link.setAttribute('aria-label', `Explore ${game.name}`);
    body.append(top, title, desc, link); card.append(art, body); grid.append(card);
  }
  const available = selected.filter(game => Boolean(game.playUrl)).length;
  const upcoming = selected.length - available;
  const counts = [];
  if (available) counts.push(`${available} available now on Android`);
  if (upcoming) counts.push(`${upcoming} in development`);
  status.textContent = counts.length ? counts.join(' · ') : 'No games in this category yet.';
  observeReveals(grid);
  refreshScrollProgress();
}
fetch('/assets/games.json').then(response => {
  if (!response.ok) throw new Error('Catalog unavailable');
  return response.json();
}).then(data => { games = data; render(); }).catch(() => {
  status.replaceChildren(document.createTextNode('Explore our games: '));
  for (const [slug, name] of [['last-tower','Last Tower'],['stickman-archer-duel','Archer Duel']]) {
    const link = document.createElement('a'); link.href = `/${slug}/`; link.textContent = name;
    status.append(link, document.createTextNode(' · '));
  }
});
document.querySelectorAll('[data-filter]').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-filter]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
    render(button.dataset.filter);
  });
});
