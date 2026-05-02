import { processCommand } from "../core/commandProcessor.js";

const testCommands = [
  null,
  {},
  { type: "MOVE" },
  { payload: { x: 10 } },

  // ✅ valid command
  { type: "MOVE", payload: { x: 10, y: 20 } },

  // ⚠️ risky command
  { type: "ATTACK", payload: { target: "unknown" } },

  // 🚨 high risk
  { type: "SELF_DESTRUCT", payload: { immediate: true } }
];

testCommands.forEach((cmd, index) => {
  console.log(`\nTest Case ${index + 1}`);
  console.log("Input:", cmd);

  const result = processCommand(cmd);

  console.log("Result:", result);
});
