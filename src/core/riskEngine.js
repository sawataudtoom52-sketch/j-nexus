export function assessRisk(cmd) {
  if (!cmd || typeof cmd !== "object") {
    return {
      level: "CRITICAL",
      action: "block",
      reasons: ["Invalid command object"]
    };
  }

  const type = String(cmd.type || "").toUpperCase();
  const reasons = [];

  if (!type) {
    return {
      level: "HIGH",
      action: "reject",
      reasons: ["Missing command type"]
    };
  }

  if (!cmd.payload) {
    return {
      level: "MEDIUM",
      action: "review",
      reasons: ["Missing command payload"]
    };
  }

  if (type === "MOVE") {
    reasons.push("Movement command requires normal validation");
    return {
      level: "LOW",
      action: "approve",
      reasons
    };
  }

  if (type === "OVERRIDE") {
    reasons.push("Override command requires commander review");
    return {
      level: "HIGH",
      action: "commanderApproval",
      reasons
    };
  }

  if (type === "EMERGENCY") {
    reasons.push("Emergency command allowed but must be audited");
    return {
      level: "MEDIUM",
      action: "review",
      reasons
    };
  }

  return {
    level: "MEDIUM",
    action: "review",
    reasons: ["Unknown command type"]
  };
}
