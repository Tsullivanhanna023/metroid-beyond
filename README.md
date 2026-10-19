# Metroid Beyond

A personal, browser-only fan exploration game inspired by Super Metroid. Explore a mysterious alien planet, discover equipment, and follow the first 32-room chapter. This repository publishes the finished **0.2.22** browser release.

This character motion restoration recovers the original complete authored running, jumping, crouching and aiming poses and their original 76-pixel cadence. It removes the later deforming leg rig and mismatched in-play body overrides. Native character textures use smooth mipmap filtering without changing the artwork or poses. The newer ship, landing pad, terrain, morph sphere, accepted boss dimensions, controls, progression, recorded soundtrack and browser-local saves are retained.

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
