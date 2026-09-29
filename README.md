# Year 8 Streaming Predictor

This repository is ready for GitHub Pages.

## Files
- `index.html` – UI and layout
- `style.css` – clean professional styling
- `rf.js` – minimal Random Forest evaluator
- `model.json` – demo forest; replace with your trained trees
- `app.js` – input handling, feature engineering, prediction and explanations
- `LICENSE` – MIT
- `README.md` – this guide

## Important
`model.json` is a DEMO model only. It is not trained or validated for formal student placement.

## Run locally
Because `app.js` loads `model.json` with `fetch()`, use a web server:

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000`.

## GitHub Pages
1. Upload all files to the repository root.
2. Go to Settings → Pages.
3. Choose Deploy from a branch.
4. Select `main` and `/ (root)`.
5. Save.

## Model format
Internal node:
```json
{"feature":"weightedAvg","threshold":64.5,"left":{},"right":{}}
```

Leaf:
```json
{"prediction":"P2"}
```

Values `<= threshold` go left; values `> threshold` go right.
