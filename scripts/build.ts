/* eslint-disable no-console */
import assert from "node:assert";
import { exec } from "node:child_process";
import fs from "node:fs";
import { join } from "node:path";

import { config } from "dotenv";

const __dirname = process.cwd();
const envDir = join(__dirname, "config");

const OUT_DIR = "dist";

function writeManifest() {
  const { manifestJSON, version: packageVersion } = JSON.parse(
    fs.readFileSync("package.json", "utf-8")
  );
  const [, , manifestVersion] = process.argv;

  if (!["2", "3"].includes(manifestVersion)) {
    console.log("Invalid manifest version. Available options: 2, 3");
    console.log("Usage:\n\n");
    console.log("node build.mjs 3");
    process.exit(1);
  }

  const versionJSON = manifestJSON[`v${manifestVersion}`];
  const manifest = {
    ...versionJSON,
    version: packageVersion,
  };

  /**
   * Add permissions to make API requests.
   */
  const apiOrigin = `${process.env.VITE_API_ORIGIN}/*`;
  if (manifestVersion === "2") {
    manifest.permissions = [...(manifest.permissions || []), apiOrigin];
  } else {
    manifest.host_permissions = [
      ...(manifest.host_permissions || []),
      apiOrigin,
    ];
  }

  fs.writeFileSync(
    join(OUT_DIR, "manifest.json"),
    JSON.stringify(manifest, null, 2),
    "utf-8"
  );
}

function main() {
  assert(process.env.NODE_ENV);
  config({ path: join(envDir, ".env") });
  config({ path: join(envDir, `.env.${process.env.NODE_ENV}`) });

  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  exec("lerna run build", (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${stderr}`);
      process.exit(1);
    }

    writeManifest();

    console.log(stdout);
  });
}

main();
