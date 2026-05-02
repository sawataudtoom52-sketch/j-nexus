import { calculateDecisionAdjustment } from "./learningEngine.js";
export function planDecision(command, context = {}) {
  const options = [];

  options.push({
    action: "execute",
    score: 0.7 + calculateDecisionAdjustment("execute"),
    reason: "Command is valid and low risk"
  });

  options.push({
    action: "execute_with_monitoring",
    score: 0.5 + calculateDecisionAdjustment("execute_with_monitoring"),
    reason: "Moderate uncertainty"
  });

  options.push({
    action: "delay",
    score: 0.3 + calculateDecisionAdjustment("delay"),
    reason: "Insufficient context"
  });

  const best = options.sort((a, b) => b.score - a.score)[0];

  return {
    decision: best.action,
    selected: best,
    options,
    contextUsed: context
  };
}
