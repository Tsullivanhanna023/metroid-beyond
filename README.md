# Metroid Beyond

A personal, browser-only fan exploration game inspired by Super Metroid. Explore a mysterious alien planet, discover equipment, and follow the first 32-room chapter. This repository publishes the finished **0.2.18** browser release.

This boss scale pass enlarges all three guardians with shared artwork, contact and projectile dimensions, grounded anchors, size-aware flight and readable attack origins. The arena floor and return/reward paths accommodate the larger encounters. Controls, character movement, soundtrack and browser-local saves are retained.

Open the repository's GitHub Pages link to play. Click the game and press a controller button to activate controller input and sound. The game's controller setup screen explains the current mappings.

Saves stay in your browser. A new hosting address has its own save storage, so saves from the previous website will not automatically appear here.

The approved recorded soundtrack remains in this release while an original score is planned. See [music and sound credits](site/AUDIO_CREDITS.txt) for the artists, sources, licenses, and adaptations.

## Publishing updates

The `site/` folder contains the ready-to-play browser release. Changes pushed to `main` run the GitHub Pages workflow, which checks every file against `release-sha256.json`, checks streamed engine assets, and deploys the same verified files. No game rebuild or Windows build runs during publishing.

The engine and game package are served in sequential chunks. Their reconstructed SHA-256 hashes match the original finished browser export. All paths remain relative so the game works at a repository Pages address.

For a local integrity check with Node.js 22 or newer:

```text
node scripts/verify.mjs
```
