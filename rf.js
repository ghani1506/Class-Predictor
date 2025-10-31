// Simple browser-side Random Forest evaluator for classification.
// Tree format:
// { feature: <index>, threshold: <number>, left: <node>, right: <node> }
// Leaf format:
// { value: [p0, p1, ..., pK] }  // class distribution (sums ~1)
class RandomForest {
  constructor(trees, classes) {
    this.trees = trees;
    this.classes = classes;
  }
  _evalTree(node, x){
    if (node.value) return node.value;
    const f = node.feature;
    const t = node.threshold;
    if (x[f] <= t) return this._evalTree(node.left, x);
    return this._evalTree(node.right, x);
  }
  predictProba(x){
    const K = this.classes.length;
    const acc = new Array(K).fill(0);
    for (const tree of this.trees){
      const p = this._evalTree(tree, x);
      for (let k=0;k<K;k++) acc[k]+=p[k];
    }
    // average
    for (let k=0;k<K;k++) acc[k]/=this.trees.length;
    return acc;
  }
  predict(x){
    const proba = this.predictProba(x);
    let best = 0, idx = 0;
    for (let i=0;i<proba.length;i++){
      if (proba[i] > best){ best = proba[i]; idx=i; }
    }
    return {label: this.classes[idx], proba, idx};
  }
}
