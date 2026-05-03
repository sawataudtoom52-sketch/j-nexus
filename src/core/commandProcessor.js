import { buildExplanation } from "./explain.js";
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
  const auth = verifyCommand(cmd);
  if (!auth.valid) {
    const result = {
      status: "rejected",
      stage: "auth",
      reason: auth.reason,
      explanation: buildExplanation({ cmd, stage: "auth" })
    };
    recordAudit({ cmd, result });
    return result;
  }

  const policy = checkPolicy(cmd, cmd.role || "operator");
  if (!policy.allowed) {
    const result = {
      status: "rejected",
      stage: "policy",
      reason: policy.reason,
      explanation: buildExplanation({ cmd, stage: "policy", policy })
    };
    recordAudit({ cmd, result });
    return result;
  }

  const trustCheck = evaluateTrust(cmd);
  if (trustCheck.flagged) {
    const result = {
      status: "rejected",
      stage: "guard",
      reason: "Low trust command",
      trust: trustCheck.trust,
      explanation: buildExplanation({
        cmd,
        stage: "guard",
        trust: trustCheck.trust
      })
    };
    recordAudit({ cmd, result });
    return result;
  }

  const history = getRecentMemory(5);

  const validation = validateCommand(cmd);
  if (!validation.valid) {
    const result = {
      status: "rejected",
      stage: "validation",
      reason: validation.reason,
      explanation: buildExplanation({
        cmd,
        stage: "validation",
        trust: trustCheck.trust
      })
    };

    storeMemory({ cmd, result, trust: trustCheck.trust });
    recordAudit({ cmd, result });
    return result;
  }

  const enforcement = enforceRules(validation.command);
  if (enforcement.status !== "validated") {
    const result = {
      status: "rejected",
      stage: "enforcement",
      reason: enforcement.reason || "Command failed enforcement",
      explanation: buildExplanation({
        cmd,
        stage: "enforcement",
        trust: trustCheck.trust
      })
    };

    storeMemory({ cmd, result, trust: trustCheck.trust });
    recordAudit({ cmd, result });
    return result;
  }

  const reasoning = reasonAboutCommand(validation.command, history);

  if (reasoning.decision === "reject") {
    const result = {
      status: "rejected",
      stage: "reasoning",
      risk: reasoning.risk,
      reasons: reasoning.reasons,
      explanation: buildExplanation({
        cmd,
        stage: "reasoning",
        reasoning,
        trust: trustCheck.trust
      })
    };

    storeMemory({ cmd, result, trust: trustCheck.trust });
    recordAudit({ cmd, result });
    return result;
  }

  if (reasoning.decision === "review") {
    const result = {
      status: "review_required",
      stage: "reasoning",
      risk: reasoning.risk,
      reasons: reasoning.reasons,
      requiredApproval: reasoning.requiredApproval || "operator",
      explanation: buildExplanation({
        cmd,
        stage: "reasoning",
        reasoning,
        trust: trustCheck.trust
      })
    };

    storeMemory({ cmd, result, trust: trustCheck.trust });
    recordAudit({ cmd, result });
    return result;
  }

  const plan = planDecision(validation.command, { history });

  const result = {
    status: "approved",
    command: validation.command,
    enforcement,
    reasoning,
    plan,
    explanation: buildExplanation({
      cmd,
      stage: "approved",
      reasoning,
      trust: trustCheck.trust
    })
  };

  storeMemory({ cmd, result, trust: trustCheck.trust });
  recordAudit({ cmd, result });
  return result;
}
