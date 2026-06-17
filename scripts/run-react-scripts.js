const { spawnSync } = require("child_process");

const [, , command, ...args] = process.argv;

if (!command) {
  console.error("A react-scripts command is required.");
  process.exit(1);
}

const majorVersion = Number(process.versions.node.split(".")[0]);
const env = { ...process.env };

if (majorVersion >= 17) {
  const existingNodeOptions = env.NODE_OPTIONS ? `${env.NODE_OPTIONS} ` : "";
  env.NODE_OPTIONS = `${existingNodeOptions}--openssl-legacy-provider`.trim();
}

if (!env.PUBLIC_URL && env.npm_package_homepage) {
  env.PUBLIC_URL = env.npm_package_homepage;
}

const reactScriptsBin = require.resolve("react-scripts/bin/react-scripts.js");
const result = spawnSync(process.execPath, [reactScriptsBin, command, ...args], {
  stdio: "inherit",
  env
});

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

process.exit(result.status === null ? 1 : result.status);
