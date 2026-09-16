import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const excludedPaths = new Set([
  "scripts/prepublish-audit.mjs",
  "scripts/verify-fixtures.mjs"
]);
const forbiddenTrackedNames = [
  /^\.env(?:$|\.(?!example$).+)/,
  /(?:^|\/)\.publication-denylist\.local$/,
  /(?:^|\/)(?:id_rsa|id_ed25519)$/,
  /\.(?:pem|p12|pfx|key)$/i
];
const unsafePatterns = [
  ["OpenAI-style secret", /\bsk-[A-Za-z0-9_-]{20,}\b/],
  ["Anthropic-style secret", /\bsk-ant-[A-Za-z0-9_-]{20,}\b/],
  ["GitHub token", /\b(?:ghp|github_pat)_[A-Za-z0-9_]{20,}\b/],
  ["Google API key", /\bAIza[A-Za-z0-9_-]{30,}\b/],
  ["private key", /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ["bearer token", /\bBearer\s+[A-Za-z0-9._~+/-]{20,}\b/i],
  ["credential assignment", /\b(?:api[_-]?key|client[_-]?secret|password)\s*[:=]\s*["']?[^\s"']{8,}/i],
  ["local user path", /\/Users\/[^/\s]+\//],
  ["Windows user path", /[A-Z]:\\Users\\[^\\\s]+\\/i],
  ["email address", /\b[A-Z0-9._%+-]+@(?!(?:example\.(?:com|org)|users\.noreply\.github\.com)\b)[A-Z0-9.-]+\.[A-Z]{2,}\b/i],
  ["IPv4 address", /\b(?:\d{1,3}\.){3}\d{1,3}\b/]
];

function git(...args) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8" });
}

const localDenylist = (await readFile(resolve(root, ".publication-denylist.local"), "utf8").catch(() => ""))
  .split(/\r?\n/)
  .map((term) => term.trim())
  .filter((term) => term && !term.startsWith("#"));
const candidates = git("ls-files", "--cached", "--others", "--exclude-standard").trim().split("\n").filter(Boolean);
const violations = [];

function scanContent(label, content) {
  for (const [kind, pattern] of unsafePatterns) {
    if (pattern.test(content)) violations.push(`${label}: possible ${kind}`);
  }
  const lower = content.toLowerCase();
  for (const term of localDenylist) {
    if (lower.includes(term.toLowerCase())) violations.push(`${label}: matches a local private term`);
  }
}

for (const path of candidates) {
  for (const pattern of forbiddenTrackedNames) {
    if (pattern.test(path)) violations.push(`${path}: sensitive file type must not be tracked`);
  }
  if (excludedPaths.has(path)) continue;
  const content = await readFile(resolve(root, path), "utf8").catch(() => "");
  scanContent(path, content);
}

const commits = git("rev-list", "--all").trim().split("\n").filter(Boolean);
for (const commit of commits) {
  scanContent(`commit ${commit.slice(0, 8)} metadata`, git("show", "-s", "--format=%an <%ae>%n%B", commit));
  const historicalPaths = git("ls-tree", "-r", "--name-only", commit).trim().split("\n").filter(Boolean);
  for (const path of historicalPaths) {
    if (excludedPaths.has(path)) continue;
    const content = git("show", `${commit}:${path}`);
    scanContent(`commit ${commit.slice(0, 8)}:${path}`, content);
  }
}

for (const path of [".env", ".env.local", ".publication-denylist.local"]) {
  try {
    execFileSync("git", ["check-ignore", "-q", path], { cwd: root });
  } catch {
    violations.push(`${path}: expected to be ignored by Git`);
  }
}

if (violations.length) {
  throw new Error(`Pre-publication audit failed:\n- ${[...new Set(violations)].join("\n- ")}`);
}

console.log(`Pre-publication audit passed: ${candidates.length} candidate files and ${commits.length} commits checked; local denylist loaded (${localDenylist.length} terms).`);
