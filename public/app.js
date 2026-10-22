import { analyzeDependencies, fixtureChanges, summary } from "/__analyzer.js";

const demoPackage = { name: "commerce-web", dependencies: { next: "^16.1.4", react: "^19.1.0", axios: "^1.7.9", zod: "^4.0.0", typescript: "^5.8.3", prisma: "^6.0.0", tailwindcss: "^4.0.0", "@tanstack/react-query": "^5.0.0" }, devDependencies: { eslint: "^9.0.0", vitest: "^3.0.0", prettier: "^3.0.0", "@types/node": "^22.0.0" } };
const state = { cards: [], filter: "all", resolved: new Set(JSON.parse(localStorage.getItem("changescope-resolved") || "[]")), actions: new Set(JSON.parse(localStorage.getItem("changescope-actions") || "[]")), analysis: null };
const $ = (selector) => document.querySelector(selector);
const list = $("#change-list"), actionList = $("#action-list"), toast = $("#toast"), dialog = $("#detail-dialog");

function esc(value) { return String(value).replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char]); }
function persist() { localStorage.setItem("changescope-resolved", JSON.stringify([...state.resolved])); localStorage.setItem("changescope-actions", JSON.stringify([...state.actions])); }
function timeAgo(value) { const hours = Math.max(1, Math.round((Date.now() - new Date(value)) / 36e5)); return `${hours}h ago`; }
function notify(message) { toast.textContent = message; toast.classList.add("show"); setTimeout(() => toast.classList.remove("show"), 2200); }

function render() {
  const totals = summary(state.cards);
  $("#metric-high").textContent = totals.high;
  $("#metric-medium").textContent = totals.medium;
  $("#metric-low").textContent = totals.low;
  $("#metric-deps").textContent = state.analysis.totalDependencies;
  $("#side-count").textContent = state.cards.filter((card) => !state.resolved.has(card.id)).length;
  $("#project-title").textContent = state.analysis.project;
  const cards = state.cards.filter((card) => state.filter === "all" || card.risk === state.filter);
  list.innerHTML = cards.length ? cards.map(cardTemplate).join("") : `<div class="empty">No ${state.filter} impact changes in this workspace.</div>`;
  renderActions();
}

function cardTemplate(card) {
  const done = state.resolved.has(card.id);
  return `<article class="change-card ${card.risk}">
    <div class="card-top"><div><div class="dependency"><span class="pkg-icon">${esc(card.dependency.slice(0, 1).toUpperCase())}</span>${esc(card.dependency)} <span>·</span> ${esc(card.source)}</div><h3>${esc(card.title)}</h3></div><span class="impact-pill ${card.risk}">${card.risk.toUpperCase()} IMPACT</span></div>
    <div class="versions"><strong>${esc(card.installed)}</strong> <span>→</span> <strong>${esc(card.to)}</strong> <span>· published ${timeAgo(card.publishedAt)}</span></div>
    <div class="card-footer"><span class="evidence">${card.confidence}% confidence · ${card.tags.map(esc).join(", ")}</span><div class="card-actions"><button class="text-button" data-detail="${card.id}">View evidence</button><button class="resolve ${done ? "done" : ""}" data-resolve="${card.id}">${done ? "Resolved ✓" : "Mark handled"}</button></div></div>
  </article>`;
}

function renderActions() {
  const prioritized = state.cards.filter((card) => card.risk !== "low");
  actionList.innerHTML = prioritized.map((card) => {
    const done = state.actions.has(card.id);
    return `<article class="action-item"><button class="check ${done ? "done" : ""}" data-action="${card.id}" aria-label="Toggle ${esc(card.dependency)} action">${done ? "✓" : ""}</button><div><h3>${esc(card.dependency)}: ${esc(card.action)}</h3><p>${card.risk === "high" ? "Prioritized because this change has security or breaking-change evidence." : "Review before the next dependency upgrade window."}</p></div></article>`;
  }).join("") || `<div class="empty">No action items generated yet.</div>`;
}

function showDetail(id) {
  const card = state.cards.find((item) => item.id === id);
  $("#dialog-content").innerHTML = `<div class="dialog-body"><p class="eyebrow">EVIDENCE / ${esc(card.source.toUpperCase())}</p><h2>${esc(card.title)}</h2><p>ReleaseLens linked this change to <strong>${esc(card.project)}</strong> because the imported manifest includes <code>${esc(card.dependency)}@${esc(card.installed)}</code>.</p><blockquote class="quote">“${esc(card.quote)}”</blockquote><div class="details"><div><span>CONFIDENCE</span><strong>${card.confidence}%</strong></div><div><span>RECOMMENDED ACTION</span><strong>${esc(card.risk.toUpperCase())}</strong></div></div><p><strong>Suggested next step:</strong> ${esc(card.action)}</p><div class="dialog-actions"><a class="secondary-button" target="_blank" rel="noreferrer" href="${esc(card.sourceUrl)}">Open source ↗</a><button class="primary-button" id="close-dialog">Close</button></div></div>`;
  dialog.showModal();
  $("#close-dialog").addEventListener("click", () => dialog.close());
}

function setAnalysis(pkg) {
  state.analysis = analyzeDependencies(pkg, fixtureChanges);
  state.cards = state.analysis.cards;
  state.resolved.clear(); state.actions.clear(); persist();
  $("#last-sync").textContent = "Just now";
  $("#sync-status").textContent = `${state.cards.length} relevant sources processed`;
  render();
}

$("#file-input").addEventListener("change", async (event) => {
  const file = event.target.files[0]; if (!file) return;
  try { setAnalysis(await file.text()); notify(`Imported ${file.name}`); } catch { notify("Could not parse this JSON file."); }
  event.target.value = "";
});

$("#sync-button").addEventListener("click", async () => {
  const button = $("#sync-button"); button.disabled = true; button.innerHTML = "<span>↻</span> Analyzing…";
  $("#sync-status").textContent = "Normalizing dependency changes";
  await new Promise((resolve) => setTimeout(resolve, 900));
  $("#last-sync").textContent = "Just now"; $("#sync-status").textContent = `${state.cards.length} relevant sources processed`;
  button.disabled = false; button.innerHTML = "<span>↻</span> Run analysis"; notify("Analysis completed with reproducible demo data.");
});

document.addEventListener("click", (event) => {
  const detail = event.target.closest("[data-detail]"); const resolve = event.target.closest("[data-resolve]"); const action = event.target.closest("[data-action]"); const filter = event.target.closest("[data-filter]"); const nav = event.target.closest("[data-view]");
  if (detail) showDetail(detail.dataset.detail);
  if (resolve) { const id = resolve.dataset.resolve; state.resolved.has(id) ? state.resolved.delete(id) : state.resolved.add(id); persist(); render(); notify("Change status updated."); }
  if (action) { const id = action.dataset.action; state.actions.has(id) ? state.actions.delete(id) : state.actions.add(id); persist(); render(); }
  if (filter) { state.filter = filter.dataset.filter; document.querySelectorAll(".filter").forEach((btn) => btn.classList.toggle("active", btn === filter)); render(); }
  if (nav) { const target = nav.dataset.view === "overview" ? "#top" : nav.dataset.view === "changes" ? "#changes-section" : "#actions-section"; document.querySelector(target).scrollIntoView({ behavior: "smooth" }); document.querySelectorAll(".nav-item").forEach((btn) => btn.classList.toggle("active", btn === nav)); }
});

$("#export-button").addEventListener("click", () => {
  const rows = state.cards.filter((card) => card.risk !== "low").map((card) => `- [${state.actions.has(card.id) ? "x" : " "}] **${card.dependency} ${card.installed} → ${card.to}** (${card.risk})\n  - Action: ${card.action}\n  - Evidence: ${card.sourceUrl}`).join("\n");
  const blob = new Blob([`# ${state.analysis.project} — ReleaseLens action plan\n\n${rows}\n`], { type: "text/markdown" });
  const url = URL.createObjectURL(blob); const a = Object.assign(document.createElement("a"), { href: url, download: "changescope-action-plan.md" }); a.click(); URL.revokeObjectURL(url); notify("Markdown action plan exported.");
});

setAnalysis(demoPackage);
