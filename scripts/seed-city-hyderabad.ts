// scripts/seed-city-hyderabad.ts
// Lightweight delegate wrapper for automated city seeder.
// Zero hardcoded restaurant data!

import { execSync } from "child_process";

console.log("🚀 Seeding Hyderabad via automated OpenStreetMap seeder...");
execSync("npx tsx scripts/seed-city.ts Hyderabad", { stdio: "inherit" });
