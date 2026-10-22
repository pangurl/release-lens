export const fixtureChanges = [
  {
    id: "next-16-2",
    dependency: "next",
    title: "Next.js 16.2 introduces a deprecated image configuration path",
    from: "16.1.4",
    to: "16.2.0",
    source: "GitHub Release",
    sourceUrl: "https://github.com/vercel/next.js/releases",
    quote: "The legacy images.domains configuration has been deprecated in favor of images.remotePatterns.",
    publishedAt: "2026-10-20T09:00:00Z",
    tags: ["breaking", "configuration"],
    confidence: 94,
    risk: "high",
    action: "Replace images.domains with images.remotePatterns, then run the image integration tests."
  },
  {
    id: "react-19-2",
    dependency: "react",
    title: "React 19.2 adds a stable Activity API",
    from: "19.1.0",
    to: "19.2.0",
    source: "npm Registry",
    sourceUrl: "https://www.npmjs.com/package/react",
    quote: "Activity is now available as a stable API for preserving UI state while hidden.",
    publishedAt: "2026-10-18T12:30:00Z",
    tags: ["feature"],
    confidence: 82,
    risk: "low",
    action: "No immediate migration required. Evaluate Activity for the settings panel during the next UI iteration."
  },
  {
    id: "axios-1-8",
    dependency: "axios",
    title: "Axios 1.8 fixes a redirect handling security issue",
    from: "1.7.9",
    to: "1.8.4",
    source: "GitHub Security Advisory",
    sourceUrl: "https://github.com/axios/axios/security",
    quote: "Upgrade to a patched release to address the redirect validation issue.",
    publishedAt: "2026-10-17T08:00:00Z",
    tags: ["security", "patch"],
    confidence: 98,
    risk: "high",
    action: "Upgrade axios, lock the resolved version, and run the HTTP client regression suite."
  },
  {
    id: "zod-4-1",
    dependency: "zod",
    title: "Zod 4.1 improves error formatting behavior",
    from: "4.0.0",
    to: "4.1.2",
    source: "GitHub Release",
    sourceUrl: "https://github.com/colinhacks/zod/releases",
    quote: "Error formatting now returns a more consistent nested object shape.",
    publishedAt: "2026-10-14T10:45:00Z",
    tags: ["behavior-change"],
    confidence: 76,
    risk: "medium",
    action: "Run validation snapshot tests before upgrading because API error rendering may change."
  },
  {
    id: "typescript-5-9",
    dependency: "typescript",
    title: "TypeScript 5.9 tightens module-resolution diagnostics",
    from: "5.8.3",
    to: "5.9.2",
    source: "GitHub Release",
    sourceUrl: "https://github.com/microsoft/TypeScript/releases",
    quote: "New diagnostics make implicit module resolution behavior more visible.",
    publishedAt: "2026-10-10T11:10:00Z",
    tags: ["tooling"],
    confidence: 72,
    risk: "medium",
    action: "Run tsc --noEmit in CI before changing the compiler version."
  }
];

export function parsePackageJson(raw) {
  const pkg = typeof raw === "string" ? JSON.parse(raw) : raw;
  const dependencies = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
  return { name: pkg.name || "Unnamed project", dependencies };
}

export function normalizeVersion(range = "") {
  return String(range).replace(/^[~^<>=\s]*/, "").split(" ")[0] || "unknown";
}

export function analyzeDependencies(pkg, changes = fixtureChanges) {
  const { name, dependencies } = parsePackageJson(pkg);
  const cards = changes
    .filter((change) => Object.hasOwn(dependencies, change.dependency))
    .map((change) => ({ ...change, installed: normalizeVersion(dependencies[change.dependency]), project: name }))
    .sort((a, b) => riskValue(b.risk) - riskValue(a.risk));
  return { project: name, totalDependencies: Object.keys(dependencies).length, cards };
}

export function riskValue(risk) {
  return ({ high: 3, medium: 2, low: 1 })[risk] || 0;
}

export function summary(cards) {
  return {
    high: cards.filter((card) => card.risk === "high").length,
    medium: cards.filter((card) => card.risk === "medium").length,
    low: cards.filter((card) => card.risk === "low").length
  };
}
