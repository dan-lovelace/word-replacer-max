import fs from "node:fs";
import path from "node:path";

import { Plugin } from "vite";

const imageExtensions = [".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp"];

export function publicImagePreload(): Plugin {
  return {
    name: "vite-public-image-preload-plugin",
    transformIndexHtml(html: string) {
      const publicDir = path.resolve("public", "preload");
      const imageFiles: string[] = [];

      function scanDirectory(directory: string) {
        const files = fs.readdirSync(directory);

        files.forEach((file) => {
          const filePath = path.join(directory, file);
          const stat = fs.statSync(filePath);

          if (stat.isDirectory()) {
            scanDirectory(filePath);
          } else if (
            imageExtensions.includes(path.extname(file).toLowerCase())
          ) {
            const relativePath =
              "/" + path.relative(publicDir, filePath).replace(/\\/g, "/");

            imageFiles.push(relativePath);
          }
        });
      }

      scanDirectory(publicDir);

      const preloadTags = imageFiles
        .map(
          (file) => `<link rel="preload" href="/preload${file}" as="image" />`
        )
        .join("\n");

      return html.replace("</head>", `${preloadTags}\n</head>`);
    },
  };
}
