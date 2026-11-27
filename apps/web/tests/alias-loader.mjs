import { register } from "node:module";
import { pathToFileURL } from "node:url";

const hooksCode = `
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

const srcRoot = ${JSON.stringify(new URL("../src/", import.meta.url).href)};

const resolveCandidatePath = (basePath) => {
  const candidates = [
    basePath,
    basePath + ".js",
    basePath + ".jsx",
    basePath + ".mjs",
    path.join(basePath, "index.js"),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return pathToFileURL(candidate).href;
    }
  }
  return null;
};

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const rel = specifier.slice(2);
    const basePath = fileURLToPath(new URL(rel, srcRoot).href);
    const resolved = resolveCandidatePath(basePath);
    return nextResolve(resolved || new URL(rel, srcRoot).href, context);
  }

  if (
    (specifier.startsWith("./") || specifier.startsWith("../")) &&
    context.parentURL
  ) {
    const basePath = fileURLToPath(new URL(specifier, context.parentURL).href);
    const resolved = resolveCandidatePath(basePath);
    if (resolved) {
      return nextResolve(resolved, context);
    }
  }

  return nextResolve(specifier, context);
}
`;

register(
  `data:text/javascript;base64,${Buffer.from(hooksCode).toString("base64")}`,
  pathToFileURL(import.meta.filename),
);
