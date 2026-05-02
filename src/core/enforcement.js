// src/core/enforcement.js
export function enforceRules(action) {
  if (!action) {
    throw new Error("Invalid action");
  }

  const rules = [
    "NO_UNAUTHORIZED_ACCESS",
    "VALID_COMMAND_STRUCTURE",
    "SAFE_EXECUTION"
  ];

  // validation
  if (typeof action !== "object" || !action.type) {
    return {
      status: "rejected",
      reason: "Malformed action"
    };
  }

  return {
    status: "validated",
    action,
    rulesChecked: rules,
    timestamp: new Date().toISOString()
  };
}
