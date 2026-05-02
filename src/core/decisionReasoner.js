import { assessRisk } from "./riskEngine.js";

export function reasonAboutCommand(cmd) {
  const risk = assessRisk(cmd);

  if (risk.action === "block") {
    return {
      decision: "reject",
      risk: risk.level,
      reasons: risk.reasons
    };
  }

  if (risk.action === "reject") {
    return {
      decision: "reject",
      risk: risk.level,
      reasons: risk.reasons
    };
  }

  if (risk.action === "commanderApproval") {
    return {
      decision: "review",
      risk: risk.level,
      reasons: risk.reasons,
      requiredApproval: "commander"
    };
  }

  if (risk.action === "review") {
    return {
      decision: "review",
      risk: risk.level,
      reasons: risk.reasons
    };
  }

  return {
    decision: "approve",
    risk: risk.level,
    reasons: risk.reasons
  };
}
