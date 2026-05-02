export function reasonAboutCommand(cmd) {
  if (!cmd || typeof cmd !== "object") {
    return {
      decision: "reject",
      risk: "high",
      reason: "Invalid command object"
    };
  }

  const reasons = [];

  if (!cmd.type) {
    reasons.push("Missing command type");
  }

  if (!cmd.payload) {
    reasons.push("Missing payload");
  }

  if (cmd.type === "MOVE" && cmd.payload && typeof cmd.payload.x === "number" && typeof cmd.payload.y === "number") {
    reasons.push("Movement command has valid coordinates");
  }

  if (reasons.length > 0 && (!cmd.type || !cmd.payload)) {
    return {
      decision: "reject",
      risk: "high",
      reasons
    };
  }

  return {
    decision: "approve",
    risk: "low",
    reasons: reasons.length ? reasons : ["Command appears structurally safe"]
  };
}
