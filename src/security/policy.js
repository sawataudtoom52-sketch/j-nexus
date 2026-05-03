export function checkPolicy(command, role = "operator") {
  const type = command?.type;

  if (type === "ATTACK" && role !== "commander") {
    return { allowed: false, reason: "ATTACK requires commander role" };
  }

  if (type === "OVERRIDE" && role !== "commander") {
    return { allowed: false, reason: "OVERRIDE restricted to commander" };
  }

  if (type === "SELF_DESTRUCT") {
    return { allowed: false, reason: "SELF_DESTRUCT is blocked" };
  }

  return { allowed: true };
}
