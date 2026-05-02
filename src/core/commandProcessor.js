import { validateCommand } from "./commandValidator.js";
import { enforceRules } from "./enforcement.js";

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

  return {
    status: "approved",
    command: validation.command,
    enforcement
  };
}
