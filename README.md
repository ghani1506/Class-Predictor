# Year 8 Streaming Predictor (Demo, Browser‑Only)

Predict (demo) the likely **streaming class** for a Year 8 student using 7 subject scores.
The page runs entirely in the browser (no server), using a light **Random Forest** evaluator.

> **Classes**: Express, Science, General, Applied, Special Applied  
> **Core subjects**: Maths, English, Science, Malay

## 🚀 Quick Start (GitHub Pages)

1. Create a new GitHub repo, e.g. `y8-streaming-rf`.
2. Upload all files in this folder to the repo root.
3. In your repo, go to **Settings → Pages**:
   - Source: **Deploy from a branch**
   - Branch: **main** (or `master`), folder: **/** (root)
4. Save. Your site will build. The public URL will be shown at the top of the Pages settings.
5. Visit the URL — you should see the predictor.

## 🧠 Model

- The demo `model.json` contains **5 shallow trees** crafted to favour the core subjects.
- `rf.js` implements a tiny Random Forest evaluator (no external libraries).
- To use **real school data**:
  1. Train a Random Forest classifier offline (Python/Scikit‑learn).
  2. Export each tree as a set of threshold nodes and leaf distributions.
  3. Replace `model.json` with your exported trees and class names.

### Example (Python export idea)

```python
# After fitting sklearn.ensemble.RandomForestClassifier(...)
# Walk each tree via estimator_.tree_ to produce JSON:
def to_json(tree, class_count):
    from sklearn.tree import _tree
    def node(i):
        if tree.feature[i] == _tree.TREE_UNDEFINED:
            # leaf: normalized class counts
            counts = tree.value[i][0]
            total = counts.sum()
            return {"value":[float(c/total) for c in counts]}
        else:
            return {
                "feature": int(tree.feature[i]),
                "threshold": float(tree.threshold[i]),
                "left": node(tree.children_left[i]),
                "right": node(tree.children_right[i])
            }
    return node(0)
```

Ensure your **feature order** matches `[Math, English, Science, Malay, Sub5, Sub6, Sub7]` and the **classes** match `["Express","Science","General","Applied","Special Applied"]` (or adapt both).

## 🧩 Files

- `index.html` – UI and layout
- `style.css` – styling (clean, professional)
- `rf.js` – minimal Random Forest evaluator
- `model.json` – demo forest (replace with your trained trees)
- `app.js` – input handling, prediction, explanations
- `LICENSE` – MIT (optional)
- `README.md` – this guide

## ⚠️ Disclaimer

This is a **demonstration**. For real placement decisions, train on your school’s historical dataset with proper validation and MOE policies. This UI does **not** store or transmit data; all predictions run locally in the browser.
