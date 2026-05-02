const axios = require("axios");
require("dotenv").config();

const BASE_URL = "http://20.207.122.201/evaluation-service";
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

const headers = {
  Authorization: `Bearer ${ACCESS_TOKEN}`,
};

// Simple Knapsack Function
function knapsack(vehicles, capacity) {
  const n = vehicles.length;

  const dp = Array.from({ length: n + 1 }, () =>
    Array(capacity + 1).fill(0)
  );

  for (let i = 1; i <= n; i++) {
    const duration = vehicles[i - 1].Duration;
    const impact = vehicles[i - 1].Impact;

    for (let w = 0; w <= capacity; w++) {
      if (duration <= w) {
        dp[i][w] = Math.max(
          dp[i - 1][w],
          impact + dp[i - 1][w - duration]
        );
      } else {
        dp[i][w] = dp[i - 1][w];
      }
    }
  }

  //  Backtrack to find selected vehicles
  let w = capacity;
  const selected = [];

  for (let i = n; i > 0; i--) {
    if (dp[i][w] !== dp[i - 1][w]) {
      selected.push(vehicles[i - 1]);
      w -= vehicles[i - 1].Duration;
    }
  }

  return {
    maxImpact: dp[n][capacity],
    selected,
  };
}

//  Main Function
async function runScheduler() {
  try {
    if (!ACCESS_TOKEN) {
      console.log("ACCESS_TOKEN missing in .env");
      return;
    }

    // Fetch depots
    const depotsRes = await axios.get(`${BASE_URL}/depots`, { headers });

    // Fetch vehicles
    const vehiclesRes = await axios.get(`${BASE_URL}/vehicles`, { headers });

    const depots = depotsRes.data.depots;
    const vehicles = vehiclesRes.data.vehicles;

    // Process each depot
    for (const depot of depots) {
      const capacity = depot.MechanicHours;

      const result = knapsack(vehicles, capacity);

     
      console.log("Depot ID:", depot.ID);
      console.log("Mechanic Hours:", capacity);
      console.log("Max Impact:", result.maxImpact);
      console.log("Selected Vehicles:");

      result.selected.forEach((v) => {
        console.log(
          `TaskID: ${v.TaskID}, Duration: ${v.Duration}, Impact: ${v.Impact}`
        );
      });
    }
  } catch (err) {
    console.error("Error:", err.response?.data || err.message);
  }
}

// Run
runScheduler();