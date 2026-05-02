const express = require("express");
const Log = require("./logger");

const app = express();
app.use(express.json());

app.use(async (req, res, next) => {
  await Log(
    "backend",
    "info",
    "middleware",
    `Incoming request: ${req.method} ${req.url}`
  );
  next();
});


app.get("/test", async (req, res) => {
  try {
    await Log("backend", "info", "route", "GET /test called");

    await Log("backend", "debug", "service", "Processing test request");

    res.send("API working successfully");

  } catch (err) {
    await Log("backend", "error", "handler", err.message);
    res.status(500).send("Something went wrong");
  }
});


app.get("/error", async (req, res) => {
  try {
    throw new Error("Simulated failure");
  } catch (err) {
    await Log("backend", "fatal", "handler", err.message);
    res.status(500).send("Error occurred");
  }
});

app.listen(3000, async () => {
  console.log("Server running on http://localhost:3000");

  await Log("backend", "info", "config", "Server started successfully");
});