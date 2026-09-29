class RandomForestEvaluator {
  constructor(model) {
    if (!model || !Array.isArray(model.classes) || !Array.isArray(model.trees)) {
      throw new Error("Invalid Random Forest model.");
    }
    this.model = model;
  }

  evaluateTree(node, features) {
    if (node.prediction !== undefined) return node.prediction;

    const value = features[node.feature];
    if (value === undefined || value === null || Number.isNaN(value)) {
      throw new Error(`Missing model feature: ${node.feature}`);
    }

    return value <= node.threshold
      ? this.evaluateTree(node.left, features)
      : this.evaluateTree(node.right, features);
  }

  predict(features) {
    const votes = Object.fromEntries(this.model.classes.map(c => [c, 0]));

    this.model.trees.forEach(tree => {
      const label = this.evaluateTree(tree, features);
      votes[label] = (votes[label] || 0) + 1;
    });

    const total = this.model.trees.length;
    const probabilities = Object.fromEntries(
      Object.entries(votes).map(([label, count]) => [label, total ? count / total : 0])
    );

    const ranked = Object.entries(probabilities).sort((a, b) => b[1] - a[1]);

    return {
      label: ranked[0][0],
      confidence: ranked[0][1],
      probabilities,
      votes,
      treeCount: total
    };
  }
}

window.RandomForestEvaluator = RandomForestEvaluator;
