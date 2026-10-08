const grid = document.querySelector('#game-grid');
const status = document.querySelector('#catalog-status');
let games = [];
function render(filter = 'all') {
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
  status.textContent = `${selected.length} games · ${filter === 'In development' ? 'Upcoming games are still in development.' : 'Available on Android. More adventures on the way.'}`;
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
