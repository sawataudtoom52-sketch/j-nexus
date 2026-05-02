import { processCommand } from "../core/commandProcessor.js";

const testCommands = [
  null,
  {},
  { type: "MOVE" },
  { payload: { x: 10 } },
  { type: "MOVE", payload: { x: 10, y: 20 } }
];

for (const cmd of testCommands) {
  const result = processCommand(cmd);
  console.log("INPUT:", cmd);
  console.log("RESULT:", result);
  console.log("-------------");
}
