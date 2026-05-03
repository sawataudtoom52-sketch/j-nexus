export function buildExplanation({ cmd, stage, reasoning, policy, trust }) {
  const explanation = [];

  if (policy && !policy.allowed) {
    explanation.push(`Policy violation: ${policy.reason}`);
  }

  if (trust !== undefined) {
    explanation.push(`Trust score: ${trust}`);
  }

  if (reasoning) {
    if (reasoning.risk) {
      explanation.push(`Risk level: ${reasoning.risk}`);
    }

    if (reasoning.reasons) {
      explanation.push(...reasoning.reasons);
    }
  }

  explanation.push(`Final stage: ${stage}`);

  return explanation;
}
