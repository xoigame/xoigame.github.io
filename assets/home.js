// Trang chủ "vào là chơi": đọc /assets/games.json — game có trường `play` vào lưới "Play in your browser",
// game chưa có bản web vào "Coming soon". Thêm game: sửa games.json, không sửa file này.
const playGrid = document.querySelector('#play-grid');
const soonGrid = document.querySelector('#soon-grid');

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text) e.textContent = text;
  return e;
}

function playCard(game) {
  const p = game.play;
  const card = el('article', 'play-card');
  card.style.setProperty('--card-accent', game.accent);

  const main = el('a', 'play-main');
  main.href = p.url;
  main.setAttribute('aria-label', `Play ${game.name}`);
  const img = el('img');
  img.src = game.image; img.alt = ''; img.loading = 'lazy'; img.width = 800; img.height = 450;
  const badges = el('span', 'play-badges');
  badges.append(el('span', p.demo ? 'badge instant' : 'badge', p.demo ? '⚡ Instant demo' : `⬇ ${p.size}`));
  badges.append(el('span', 'badge', p.orientation === 'landscape' ? '↔ Landscape' : '↕ Portrait'));
  main.append(img, badges, el('span', 'play-chip', '▶ PLAY'));

  const body = el('div', 'play-body');
  if (p.icon) {
    const icon = el('img', 'play-icon');
    icon.src = p.icon; icon.alt = ''; icon.loading = 'lazy'; icon.width = 52; icon.height = 52;
    body.append(icon);
  }
  const title = el('div', 'play-title');
  title.append(el('h3', '', game.name), el('p', '', game.genre));
  body.append(title);

  const links = el('div', 'play-links');
  if (game.playUrl) {
    const a = el('a', '', 'Get the app ↗');
    a.href = game.playUrl; a.rel = 'noopener';
    links.append(a);
  }
  const about = el('a', '', 'About the game');
  about.href = `/${game.slug}/`;
  links.append(about);

  card.append(main, body, links);
  return card;
}

function soonCard(game) {
  const a = el('a', 'soon-card');
  a.href = `/${game.slug}/`;
  const img = el('img');
  img.src = game.image; img.alt = ''; img.loading = 'lazy'; img.width = 640; img.height = 400;
  const d = el('div');
  d.append(el('h3', '', game.name), el('p', '', game.genre));
  a.append(img, d);
  return a;
}

fetch('/assets/games.json?v=20261109')
  .then((r) => {
    if (!r.ok) throw new Error('catalog');
    return r.json();
  })
  .then((games) => {
    playGrid.replaceChildren(...games.filter((g) => g.play).map(playCard));
    soonGrid.replaceChildren(...games.filter((g) => !g.play).map(soonCard));
  })
  .catch(() => {
    playGrid.textContent = 'Could not load the game list. Please refresh the page.';
  });
