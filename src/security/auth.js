export function verifyCommand(command) {
  if (!command || !command.signature) {
    return { valid: false, reason: "Missing signature" };
  }

  // Mock signature check for prototype only.
  // Production must replace this with cryptographic verification.
  if (command.signature !== "trusted") {
    return { valid: false, reason: "Invalid signature" };
  }

  return { valid: true };
}
