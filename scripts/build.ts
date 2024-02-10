/* eslint-disable no-console */
import { exec } from "child_process";
import fs from "fs";
import path from "path";

const OUT_DIR = "dist";

function writeManifest() {
  const { manifestJSON, version: packageVersion } = JSON.parse(
    fs.readFileSync("package.json", "utf-8")
  );
  const [, , manifestVersion = "3"] = process.argv;

  if (!["2", "3"].includes(manifestVersion)) {
    console.log("Invalid manifest version. Available options: 2, 3");
    console.log("Usage: node build.mjs 3");
    process.exit(1);
  }

  const versionJSON = manifestJSON[`v${manifestVersion}`];
  const manifest = {
    ...versionJSON,
    version: packageVersion,
  };

  fs.writeFileSync(
    path.join(OUT_DIR, "manifest.json"),
    JSON.stringify(manifest, null, 2),
    "utf-8"
  );
}

function main() {
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
