const learningHistory = [];

export function recordOutcome(decision, outcome) {
  learningHistory.push({
    decision,
    outcome,
    timestamp: new Date().toISOString()
  });

  if (learningHistory.length > 100) {
    learningHistory.shift();
  }
}

export function getLearningHistory(limit = 20) {
  return learningHistory.slice(-limit);
}

export function calculateDecisionAdjustment(action) {
  const related = learningHistory.filter(
    item => item.decision && item.decision.action === action
  );

  if (related.length === 0) {
    return 0;
  }

  const successCount = related.filter(item => item.outcome === "success").length;
  const failureCount = related.filter(item => item.outcome === "failure").length;

  return (successCount - failureCount) * 0.05;
}
