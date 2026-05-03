import { planDecision } from "./decisionPlanner.js";
import { validateCommand } from "./commandValidator.js";
import { enforceRules } from "./enforcement.js";
import { reasonAboutCommand } from "./decisionReasoner.js";
import { storeMemory, getRecentMemory } from "./memoryStore.js";

import { verifyCommand } from "../security/auth.js";
import { checkPolicy } from "../security/policy.js";
import { recordAudit } from "../security/audit.js";
import { evaluateTrust } from "../security/guard.js";

export function processCommand(cmd) {

  // 🔐 AUTH
  const auth = verifyCommand(cmd);
  if (!auth.valid) {
    const result = {
      status: "rejected",
      stage: "auth",
      reason: auth.reason
    };
    recordAudit({ cmd, result });
    return result;
  }

  // 🛡 POLICY
  const policy = checkPolicy(cmd, cmd.role || "operator");
  if (!policy.allowed) {
    const result = {
      status: "rejected",
      stage: "policy",
      reason: policy.reason
    };
    recordAudit({ cmd, result });
    return result;
  }

  // 🧠 TRUST GUARD
  const trustCheck = evaluateTrust(cmd);
  if (trustCheck.flagged) {
    const result = {
      status: "rejected",
      stage: "guard",
      reason: "Low trust command",
      trust: trustCheck.trust
    };
    recordAudit({ cmd, result });
    return result;
  }

  const history = getRecentMemory(5);

  // ✅ VALIDATION
  const validation = validateCommand(cmd);
  if (!validation.valid) {
    const result = {
      status: "rejected",
      stage: "validation",
      reason: validation.reason
    };
    if (!trustCheck.flagged) {
      storeMemory({ cmd, result, trust: trustCheck.trust });
    }
    recordAudit({ cmd, result });
    return result;
  }

  // ⚙ ENFORCEMENT
  const enforcement = enforceRules(validation.command);
  if (enforcement.status !== "validated") {
    const result = {
      status: "rejected",
      stage: "enforcement",
      reason: enforcement.reason || "Command failed enforcement"
    };
    if (!trustCheck.flagged) {
      storeMemory({ cmd, result, trust: trustCheck.trust });
    }
    recordAudit({ cmd, result });
    return result;
  }

  // 🤖 REASONING
  const reasoning = reasonAboutCommand(validation.command, history);

  if (reasoning.decision === "reject") {
    const result = {
      status: "rejected",
      stage: "reasoning",
      risk: reasoning.risk,
      reasons: reasoning.reasons
    };
    if (!trustCheck.flagged) {
      storeMemory({ cmd, result, trust: trustCheck.trust });
    }
    recordAudit({ cmd, result });
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
    if (!trustCheck.flagged) {
      storeMemory({ cmd, result, trust: trustCheck.trust });
    }
    recordAudit({ cmd, result });
    return result;
  }

  // 📊 PLANNING
  const plan = planDecision(validation.command, { history });

  const result = {
    status: "approved",
    command: validation.command,
    enforcement,
    reasoning,
    plan
  };

  if (!trustCheck.flagged) {
    storeMemory({ cmd, result, trust: trustCheck.trust });
  }

  recordAudit({ cmd, result });
  return result;
}
