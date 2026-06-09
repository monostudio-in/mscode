"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var node_diagnostics_exports = {};
__export(node_diagnostics_exports, {
  generateProjectManifest: () => generateProjectManifest
});
module.exports = __toCommonJS(node_diagnostics_exports);
var import_fs = __toESM(require("fs"));
var import_path = __toESM(require("path"));
var import_js_yaml = __toESM(require("js-yaml"));
var import_parsers = require("@yarnpkg/parsers");
var import_package_manifest = require("./package-manifest");
var import_debug = __toESM(require("./debug"));
function classifySource(resolvedUrl) {
  if (!resolvedUrl)
    return {};
  if (resolvedUrl.startsWith("file:")) {
    return { source: "file", sourceUrl: resolvedUrl.slice("file:".length) };
  }
  if (resolvedUrl.startsWith("git+") || resolvedUrl.startsWith("git://")) {
    return { source: "git", sourceUrl: resolvedUrl.replace(/^git\+/, "") };
  }
  try {
    const url = new URL(resolvedUrl);
    return { source: "registry", sourceUrl: url.origin };
  } catch {
    return {};
  }
}
function npmEntryScopes(entry) {
  const scopes = [];
  if (entry.dev)
    scopes.push("dev");
  if (entry.peer)
    scopes.push("peer");
  if (entry.optional)
    scopes.push("optional");
  if (scopes.length === 0)
    scopes.push("prod");
  return scopes;
}
function parseNpmLock(content, lockfileVersion) {
  const lockMap = /* @__PURE__ */ new Map();
  const parsed = JSON.parse(content);
  const lv = lockfileVersion ?? parsed.lockfileVersion ?? 1;
  if (lv >= 2) {
    const packages = parsed.packages;
    if (!packages)
      return lockMap;
    for (const [key, entry] of Object.entries(packages)) {
      if (key === "")
        continue;
      if (!key.startsWith("node_modules/"))
        continue;
      if (entry.link === true)
        continue;
      const rest = key.slice("node_modules/".length);
      const isScoped = rest.startsWith("@");
      const slashCount = (rest.match(/\//g) ?? []).length;
      if (isScoped ? slashCount !== 1 : slashCount !== 0)
        continue;
      const resolved = entry.resolved;
      if (resolved?.startsWith("file:"))
        continue;
      const version = entry.version ?? "";
      const existing = lockMap.get(rest);
      if (existing && !isHigherVersion(version, existing.resolved))
        continue;
      const { source, sourceUrl } = classifySource(resolved);
      const lockEntry = {
        resolved: version,
        scopes: npmEntryScopes(entry)
      };
      if (source)
        lockEntry.source = source;
      if (sourceUrl)
        lockEntry.sourceUrl = sourceUrl;
      lockMap.set(rest, lockEntry);
    }
  } else {
    const dependencies = parsed.dependencies;
    if (!dependencies)
      return lockMap;
    const walk = (deps) => {
      for (const [name, entry] of Object.entries(deps)) {
        const resolved = entry.resolved;
        if (!resolved?.startsWith("file:")) {
          const version = entry.version ?? "";
          const existing = lockMap.get(name);
          if (!existing || isHigherVersion(version, existing.resolved)) {
            const { source, sourceUrl } = classifySource(resolved);
            const lockEntry = {
              resolved: version,
              scopes: npmEntryScopes(entry)
            };
            if (source)
              lockEntry.source = source;
            if (sourceUrl)
              lockEntry.sourceUrl = sourceUrl;
            lockMap.set(name, lockEntry);
          }
        }
        const nested = entry.dependencies;
        if (nested)
          walk(nested);
      }
    };
    walk(dependencies);
  }
  return lockMap;
}
function isHigherVersion(a, b) {
  const seg = (v) => v.split(/[.\-+]/).map((s) => parseInt(s, 10) || 0);
  const pa = seg(a);
  const pb = seg(b);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    if ((pa[i] ?? 0) > (pb[i] ?? 0))
      return true;
    if ((pa[i] ?? 0) < (pb[i] ?? 0))
      return false;
  }
  return false;
}
function extractPackageName(spec) {
  const s = spec.replace(/\(.*\)$/, "");
  if (s.startsWith("@")) {
    const i2 = s.indexOf("@", 1);
    return i2 === -1 ? null : s.slice(0, i2);
  }
  const i = s.lastIndexOf("@");
  return i <= 0 ? null : s.slice(0, i);
}
function parsePnpmV9Key(key) {
  const name = extractPackageName(key);
  if (!name)
    return null;
  const withoutPeers = key.replace(/\(.*\)$/, "");
  return { name, version: withoutPeers.slice(name.length + 1) };
}
function parsePnpmV5Key(key) {
  if (!key.startsWith("/"))
    return null;
  const rest = key.slice(1);
  if (rest.startsWith("@")) {
    const firstSlash = rest.indexOf("/");
    if (firstSlash === -1)
      return null;
    const secondSlash = rest.indexOf("/", firstSlash + 1);
    if (secondSlash === -1)
      return null;
    const name2 = rest.slice(0, secondSlash);
    const version2 = rest.slice(secondSlash + 1).split("_")[0];
    return { name: name2, version: version2 };
  }
  const slashIndex = rest.indexOf("/");
  if (slashIndex === -1)
    return null;
  const name = rest.slice(0, slashIndex);
  const version = rest.slice(slashIndex + 1).split("_")[0];
  return { name, version };
}
function parsePnpmV6Key(key) {
  if (!key.startsWith("/"))
    return null;
  const rest = key.slice(1);
  let atIdx;
  if (rest.startsWith("@")) {
    atIdx = rest.indexOf("@", 1);
  } else {
    atIdx = rest.indexOf("@");
  }
  if (atIdx === -1)
    return null;
  const name = rest.slice(0, atIdx);
  const version = rest.slice(atIdx + 1).split("_")[0].replace(/\(.*\)$/, "");
  return { name, version };
}
function classifyPnpmResolution(resolution) {
  if (!resolution)
    return {};
  if (resolution.type === "directory" || resolution.directory)
    return { local: true };
  if (typeof resolution.tarball === "string")
    return classifySource(resolution.tarball);
  if (resolution.type === "git" || typeof resolution.repo === "string") {
    return {
      source: "git",
      sourceUrl: resolution.repo ?? void 0
    };
  }
  return {};
}
function parsePnpmLock(content, lockfileVersion) {
  const lockMap = /* @__PURE__ */ new Map();
  const docs = [];
  import_js_yaml.default.safeLoadAll(
    content,
    (doc) => docs.push(doc)
  );
  const parsedYaml = docs[0];
  if (!parsedYaml)
    return lockMap;
  const lv = lockfileVersion ?? Number(parsedYaml.lockfileVersion ?? "0");
  const packages = parsedYaml.packages;
  if (!packages)
    return lockMap;
  const parseKey = lv >= 9 ? parsePnpmV9Key : lv >= 6 ? parsePnpmV6Key : parsePnpmV5Key;
  for (const [key, entry] of Object.entries(packages)) {
    const keyParsed = parseKey(key);
    if (!keyParsed)
      continue;
    const { name, version } = keyParsed;
    const resolution = entry.resolution;
    const { local, source, sourceUrl } = classifyPnpmResolution(resolution);
    if (local)
      continue;
    const existing = lockMap.get(name);
    if (existing && !isHigherVersion(version, existing.resolved))
      continue;
    const lockEntry = { resolved: version, scopes: ["prod"] };
    if (source)
      lockEntry.source = source;
    if (sourceUrl)
      lockEntry.sourceUrl = sourceUrl;
    lockMap.set(name, lockEntry);
  }
  return lockMap;
}
function parseYarnLock(content, lockfileVersion) {
  const lockMap = /* @__PURE__ */ new Map();
  const isBerry = (lockfileVersion ?? 1) >= 2;
  const parsed = (0, import_parsers.parseSyml)(content);
  for (const [key, entry] of Object.entries(parsed)) {
    if (key === "__metadata" || !entry)
      continue;
    if (isBerry && entry.linkType === "soft")
      continue;
    const version = entry.version;
    if (!version)
      continue;
    let source;
    let sourceUrl;
    if (!isBerry && entry.resolved) {
      if (entry.resolved.startsWith("file:"))
        continue;
      const classified = classifySource(entry.resolved);
      source = classified.source;
      sourceUrl = classified.sourceUrl;
    }
    const specifiers = key.split(",").map((s) => s.trim().replace(/^"|"$/g, ""));
    let name = null;
    for (const spec of specifiers) {
      name = extractPackageName(spec);
      if (name)
        break;
    }
    if (!name)
      continue;
    const existing = lockMap.get(name);
    if (existing && !isHigherVersion(version, existing.resolved))
      continue;
    const lockEntry = { resolved: version, scopes: ["prod"] };
    if (source)
      lockEntry.source = source;
    if (sourceUrl)
      lockEntry.sourceUrl = sourceUrl;
    lockMap.set(name, lockEntry);
  }
  return lockMap;
}
function parseBunLock(content) {
  const lockMap = /* @__PURE__ */ new Map();
  const json = content.replace(/,(\s*[}\]])/g, "$1");
  const parsed = JSON.parse(json);
  const packages = parsed.packages;
  if (!packages)
    return lockMap;
  for (const [name, value] of Object.entries(packages)) {
    if (!Array.isArray(value))
      continue;
    const ref = value[0];
    if (!ref || typeof ref !== "string")
      continue;
    const pkgName = extractPackageName(ref);
    if (!pkgName)
      continue;
    const version = ref.slice(pkgName.length + 1);
    if (!version)
      continue;
    if (version.startsWith("file:") || version.startsWith("workspace:"))
      continue;
    const existing = lockMap.get(name);
    if (existing && !isHigherVersion(version, existing.resolved))
      continue;
    lockMap.set(name, { resolved: version, scopes: ["prod"] });
  }
  return lockMap;
}
async function parseLockfile(cliType, lockfilePath, lockfileVersion) {
  if (cliType === "bun" && lockfileVersion === 0)
    return /* @__PURE__ */ new Map();
  if (cliType === "vlt")
    return /* @__PURE__ */ new Map();
  const content = await import_fs.default.promises.readFile(lockfilePath, "utf-8");
  switch (cliType) {
    case "npm":
      return parseNpmLock(content, lockfileVersion);
    case "pnpm":
      return parsePnpmLock(content, lockfileVersion);
    case "yarn":
      return parseYarnLock(content, lockfileVersion);
    case "bun":
      return parseBunLock(content);
    default:
      return /* @__PURE__ */ new Map();
  }
}
async function readPackageJson(startDir) {
  let current = startDir;
  for (; ; ) {
    try {
      const content = await import_fs.default.promises.readFile(
        import_path.default.join(current, "package.json"),
        "utf-8"
      );
      return JSON.parse(content);
    } catch {
      const parent = import_path.default.dirname(current);
      if (parent === current)
        return null;
      current = parent;
    }
  }
}
function buildDirectMaps(pkgJson) {
  const directScopes = /* @__PURE__ */ new Map();
  const directRequested = /* @__PURE__ */ new Map();
  const add = (deps, scope) => {
    if (!deps || typeof deps !== "object")
      return;
    for (const [name, specifier] of Object.entries(
      deps
    )) {
      if (!directScopes.has(name))
        directScopes.set(name, /* @__PURE__ */ new Set());
      directScopes.get(name).add(scope);
      if (!directRequested.has(name))
        directRequested.set(name, specifier);
    }
  };
  add(pkgJson.dependencies, "prod");
  add(pkgJson.devDependencies, "dev");
  add(pkgJson.peerDependencies, "peer");
  add(pkgJson.optionalDependencies, "optional");
  return { directScopes, directRequested };
}
async function generateProjectManifest({
  workPath,
  nodeVersion,
  cliType,
  lockfilePath,
  lockfileVersion,
  framework,
  serviceType
}) {
  try {
    const pkgJson = await readPackageJson(workPath);
    if (!pkgJson)
      return;
    const { directScopes, directRequested } = buildDirectMaps(pkgJson);
    const lockMap = lockfilePath ? await parseLockfile(cliType, lockfilePath, lockfileVersion) : /* @__PURE__ */ new Map();
    const directDeps = [];
    const transitiveDeps = [];
    for (const [name, scopes] of directScopes) {
      const lock = lockMap.get(name);
      const dep = {
        name,
        type: "direct",
        scopes: [...scopes].sort(),
        requested: directRequested.get(name),
        resolved: lock?.resolved ?? ""
      };
      if (lock?.source)
        dep.source = lock.source;
      if (lock?.sourceUrl)
        dep.sourceUrl = lock.sourceUrl;
      directDeps.push(dep);
    }
    for (const [name, lock] of lockMap) {
      if (directScopes.has(name))
        continue;
      const dep = {
        name,
        type: "transitive",
        scopes: lock.scopes,
        resolved: lock.resolved
      };
      if (lock.source)
        dep.source = lock.source;
      if (lock.sourceUrl)
        dep.sourceUrl = lock.sourceUrl;
      transitiveDeps.push(dep);
    }
    const runtimeVersion = {
      resolved: String(nodeVersion.major)
    };
    const enginesNode = pkgJson.engines?.node;
    if (enginesNode) {
      runtimeVersion.requested = enginesNode;
      runtimeVersion.requestedSource = "package.json";
    } else {
      for (const filename of [".node-version", ".nvmrc"]) {
        try {
          const val = await import_fs.default.promises.readFile(
            import_path.default.join(workPath, filename),
            "utf-8"
          );
          const trimmed = val.trim();
          if (trimmed) {
            runtimeVersion.requested = trimmed;
            runtimeVersion.requestedSource = filename;
            break;
          }
        } catch {
        }
      }
    }
    const manifest = {
      version: import_package_manifest.MANIFEST_VERSION,
      runtime: "node",
      ...framework ? { framework } : {},
      ...serviceType ? { serviceType } : {},
      runtimeVersion,
      dependencies: [
        ...directDeps.sort((a, b) => a.name.localeCompare(b.name)),
        ...transitiveDeps.sort((a, b) => a.name.localeCompare(b.name))
      ]
    };
    await (0, import_package_manifest.writeProjectManifest)(manifest, workPath, "node");
  } catch (err) {
    (0, import_debug.default)(
      `generateProjectManifest: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  generateProjectManifest
});
