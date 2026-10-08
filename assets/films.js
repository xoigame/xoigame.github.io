// The ordinary YouTube link also works when JavaScript is unavailable.
document.querySelectorAll('[data-film-id]').forEach(link => {
  link.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
    const id = link.dataset.filmId;
    if (!/^[A-Za-z0-9_-]{11}$/.test(id)) return;
    const screen = link.closest('.film-screen');
    if (!screen) return;
    event.preventDefault();
    const player = document.createElement('iframe');
    player.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
    player.title = link.dataset.filmTitle;
    player.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    player.allowFullscreen = true;
    player.referrerPolicy = 'strict-origin-when-cross-origin';
    screen.replaceChildren(player);
    player.focus();
  });
});
