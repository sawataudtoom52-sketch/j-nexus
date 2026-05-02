import { validateCommand } from "./commandValidator.js";
import { enforceRules } from "./enforcement.js";
import { reasonAboutCommand } from "./decisionReasoner.js";

export function processCommand(cmd) {
  const validation = validateCommand(cmd);

  if (!validation.valid) {
    return {
      status: "rejected",
      stage: "validation",
      reason: validation.reason
    };
  }

  const enforcement = enforceRules(validation.command);

  if (enforcement.status !== "validated") {
    return {
      status: "rejected",
      stage: "enforcement",
      reason: enforcement.reason || "Command failed enforcement"
    };
  }

  const reasoning = reasonAboutCommand(validation.command);

  if (reasoning.decision === "reject") {
    return {
      status: "rejected",
      stage: "reasoning",
      risk: reasoning.risk,
      reasons: reasoning.reasons
    };
  }

  if (reasoning.decision === "review") {
    return {
      status: "review_required",
      stage: "reasoning",
      risk: reasoning.risk,
      reasons: reasoning.reasons,
      requiredApproval: reasoning.requiredApproval || "operator"
    };
  }

  return {
    status: "approved",
    command: validation.command,
    enforcement,
    reasoning
  };
}
