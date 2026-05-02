export function validateCommand(cmd) {
  if (!cmd || typeof cmd !== "object") {
    return { valid: false, reason: "Invalid command format" };
  }

  if (!cmd.type) {
    return { valid: false, reason: "Missing command type" };
  }

  if (!cmd.payload) {
    return { valid: false, reason: "Missing payload" };
  }

  return {
    valid: true,
    command: cmd
  };
}
