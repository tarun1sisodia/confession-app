import fs from "node:fs";
import path from "node:path";

const configPath = path.resolve(process.cwd(), "release.config.json");
const current = JSON.parse(fs.readFileSync(configPath, "utf8"));
const args = process.argv.slice(2);

if (args.includes("--show")) {
  console.log(JSON.stringify(current, null, 2));
  process.exit(0);
}

function bumpPatch(versionName) {
  const [major = "1", minor = "0", patch = "0"] = String(versionName).split(".");
  return `${major}.${minor}.${Number.parseInt(patch, 10) + 1}`;
}

const nextVersionName = args[0] || bumpPatch(current.androidVersionName);
const nextConfig = {
  androidVersionCode: Number(current.androidVersionCode || 0) + 1,
  androidVersionName: nextVersionName
};

fs.writeFileSync(configPath, `${JSON.stringify(nextConfig, null, 2)}\n`);
console.log(`Updated Android release config to code ${nextConfig.androidVersionCode} (${nextConfig.androidVersionName})`);
