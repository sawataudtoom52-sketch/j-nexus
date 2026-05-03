import express from "express";
import { processCommand } from "./src/core/commandProcessor.js";

const app = express();

app.use(express.json());

app.post("/command", (req, res) => {
  try {
    const cmd = req.body;
    const result = processCommand(cmd);

    res.json({
      success: true,
      result
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

app.get("/", (req, res) => {
  res.send("J-NEXUS AI is running");
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
