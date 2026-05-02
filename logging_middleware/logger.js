const axios = require("axios");
require("dotenv").config();

const LOG_API = "http://20.207.122.201/evaluation-service/logs";
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;


const validStacks = ["backend", "frontend"];
const validLevels = ["debug", "info", "warn", "error", "fatal"];
const validPackages = [
  "cache", "controller", "cron_job", "domain",
  "handler", "repository", "route", "service",
  "auth", "config", "middleware", "utils"
];


async function Log(stack, level, pkg, message) {
  try {

    if (!validStacks.includes(stack)) {
      throw new Error("Invalid stack value");
    }
    if (!validLevels.includes(level)) {
      throw new Error("Invalid level value");
    }
    if (!validPackages.includes(pkg)) {
      throw new Error("Invalid package value");
    }

    const response = await axios.post(
      LOG_API,
      {
        stack: stack,
        level: level,
        package: pkg,
        message: message,
      },
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Log sent:", response.data.message);
    console.log("TOKEN:", ACCESS_TOKEN);
  } catch (error) {
    console.error("Logging failed:", error.message);
  }
}

module.exports = Log;