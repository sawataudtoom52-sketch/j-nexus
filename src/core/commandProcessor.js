import { validateCommand } from "./commandValidator.js";
import { enforceRules } from "./enforcement.js";
import { reasonAboutCommand } from "./decisionReasoner.js";
import { storeMemory, getRecentMemory } from "./memoryStore.js";

export function processCommand(cmd) {
  const history = getRecentMemory(5);

  const validation = validateCommand(cmd);

  if (!validation.valid) {
    const result = {
      status: "rejected",
      stage: "validation",
      reason: validation.reason
    };

    storeMemory({ cmd, result });
    return result;
  }

  const enforcement = enforceRules(validation.command);

  if (enforcement.status !== "validated") {
    const result = {
      status: "rejected",
      stage: "enforcement",
      reason: enforcement.reason || "Command failed enforcement"
    };

    storeMemory({ cmd, result });
    return result;
  }

  const reasoning = reasonAboutCommand(validation.command, history);

  if (reasoning.decision === "reject") {
    const result = {
      status: "rejected",
      stage: "reasoning",
      risk: reasoning.risk,
      reasons: reasoning.reasons
    };

    storeMemory({ cmd, result });
    return result;
  }

  if (reasoning.decision === "review") {
    const result = {
      status: "review_required",
      stage: "reasoning",
      risk: reasoning.risk,
      reasons: reasoning.reasons,
      requiredApproval: reasoning.requiredApproval || "operator"
    };

    storeMemory({ cmd, result });
    return result;
  }

  const result = {
    status: "approved",
    command: validation.command,
    enforcement,
    reasoning
  };

  storeMemory({ cmd, result });
  return result;
}
