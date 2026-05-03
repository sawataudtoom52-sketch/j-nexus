// simple anomaly / trust guard (prototype)

export function evaluateTrust(cmd, context = {}) {
  let score = 1.0;

  // missing fields
  if (!cmd?.type) score -= 0.3;
  if (!cmd?.payload) score -= 0.2;

  // invalid role
  if (!["operator", "commander"].includes(cmd?.role || "operator")) {
    score -= 0.3;
  }

  // abnormal size
  const size = JSON.stringify(cmd).length;
  if (size > 2000) score -= 0.3;

  return {
    trust: Math.max(0, score),
    flagged: score < 0.5
  };
}
