# Website media sources

The public website currently features only Last Tower and Stickman Archer Duel (author scope, 2026-10-08). All media is existing studio-owned material; no stock downloads or new generated artwork were needed.

- `brand.png`: GameDevHub/game-promo/content/_studio/social/avatar_800.png.
- `games/archer-*`: GameDevHub/game-promo/content/stickmanarcherduel/store/play/, exported as optimized web images.
- `/last-tower/img/*`: existing published Last Tower promotional artwork and store screenshots, retained unchanged.
- `video/last-tower.mp4`: GameDevHub/game-promo/content/lasttower/exports/2026-10-06_1122/LastTower_promo_2026-10-06_1122_16x9_1920x1080.mp4.
- `video/stickman-archer-duel.mp4`: GameDevHub/game-promo/content/stickmanarcherduel/exports/2026-10-08_1437/StickmanArcherDuel_promo_2026-10-08_1437_16x9_1920x1080.mp4.

Videos are H.264/AAC, 1280×720, CRF 26, with faststart; audio and edit preserved. HTML uses controls, playsinline, posters and preload=none. Archer Duel is still in development; its trailer is a preview, without a public install link.

## Ring Sort (2026-11-08)

- `games/ring-sort-hero.jpg`: RingSort/StoreAssets/play/feature-1024x500.png (studio-owned Play feature graphic), re-encoded as JPEG.
- `games/ring-sort-01..04.jpg`: 720×1280 captures of the Ring Sort playable demo (art from the game itself), rendered in headless Edge.
- `/ring-sort/play/{quick,challenge}.html`: playable demo builds from GameDevHub `packages/playable-ads` (`npm run build -- ringsort --network web`, variants `a-quick` / `b-challenge`). Single self-contained HTML, ~0.9 MB each; rebuild there and copy over, never edit by hand.

## Bolt Pop (2026-11-09)

- `games/bolt-pop-01..03.jpg`: 720×1280 JPEG re-encodes of captures from the game itself (BoltPop `Logs/Shots`, level 1, menu, decorated garage).
- `games/bolt-pop-hero.jpg`: 1280×720 composite of the studio-owned logo, app icon and two of those captures. `games/bolt-pop-icon.png`: 512×512 app icon.

## Wool Bloom (2026-11-10)

- `games/wool-bloom-01..03.jpg`: 720×1280 JPEG re-encodes of captures from the game itself (WoolBloom `Logs/Shots`: level 12, level 1 tutorial, decorated Cozy Nook).
- `games/wool-bloom-hero.jpg`: 1280×720 composite of the studio-owned logo, Ollie mascot and spool art (WoolBloom `Tools/store_art.py`). `games/wool-bloom-icon.png`: 512×512 app icon.
