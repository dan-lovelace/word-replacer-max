/* eslint-disable no-console */
import assert from "node:assert";
import { exec } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import archiver from "archiver";

import { distDir, versionsDir } from "./lib/config";

function main() {
  assert(
    process.env.NODE_ENV === "production",
    "NODE_ENV must be 'production' to package"
  );

  const manifestVersion = process.argv[2];
  const packageJson = fs.readFileSync("package.json", "utf-8");
  const { name, version: packageVersion } = JSON.parse(packageJson);
  const outputFile = path.join(
    versionsDir,
    `${name}_${packageVersion}_m${manifestVersion}.zip`
  );

  if (fs.existsSync(outputFile)) {
    throw new Error(`Output file already exists: ${outputFile}`);
  }

  exec(`yarn build ${manifestVersion}`, (execError, stdout, stderr) => {
    if (execError) {
      console.log(stderr);
      process.exit(1);
    }

    if (!fs.existsSync(versionsDir)) {
      fs.mkdirSync(versionsDir);
    }

    if (manifestVersion === "2") {
      // remove development settings from manifest
      const manifestLocation = path.join(distDir, "manifest.json");
      const versionJSON = JSON.parse(
        fs.readFileSync(manifestLocation, "utf-8")
      );

      delete versionJSON["browser_specific_settings"];
      fs.writeFileSync(manifestLocation, JSON.stringify(versionJSON), "utf-8");
    }

    const output = fs.createWriteStream(outputFile);
    const archive = archiver("zip", {
      zlib: {
        level: 9,
      },
    });

    archive.on("error", (archiveError) => {
      throw archiveError;
    });

    archive.pipe(output);
    archive.glob("**/*", {
      cwd: distDir,
      ignore: [".DS_Store"],
    });
    archive.finalize();

    output.on("close", () => {
      console.log(stdout);
    });
  });
}

main();
