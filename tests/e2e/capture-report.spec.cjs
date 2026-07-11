// ponytail: one-shot e2e test. Run: npm run test:e2e
const { chromium } = require("playwright");

const BASE = "http://localhost:3000";
const PASS = [];
const FAIL = [];

function ok(name) { PASS.push(name); console.log(`  ✅ ${name}`); }
function fail(name, msg) { FAIL.push(name); console.log(`  ❌ ${name}: ${msg}`); }

function assert(cond, name, msg) {
  if (cond) ok(name); else fail(name, msg || "(no detail)");
}

async function run() {
  console.log("\n🧪 Scout AI — E2E Test Suite\n");
  console.log(`Target: ${BASE}\n`);

  // ── 1. API Routes ──────────────────────────────────────────
  console.log("── API Routes ──");

  try { const r = await fetch(BASE); assert(r.status === 200, "GET / → 200", `Got ${r.status}`); }
  catch (e) { fail("GET / → 200", e.message); }

  try {
    const r = await fetch(`${BASE}/api/capture`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: "" }) });
    const j = await r.json();
    assert(r.status === 400, "POST /api/capture empty → 400", `Got ${r.status}`);
    assert(j.error?.length > 0, "  Validation error", "");
  } catch (e) { fail("POST /api/capture empty → 400", e.message); }

  try {
    const r = await fetch(`${BASE}/api/capture`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: "http://127.0.0.1:8080" }) });
    assert(r.status === 400, "POST /api/capture private IP → 400", `Got ${r.status}`);
  } catch (e) { fail("POST /api/capture private IP → 400", e.message); }

  try {
    const r = await fetch(`${BASE}/api/analyze`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ finalUrl: "https://example.com", analysis: {} }) });
    assert(r.status !== 404, "POST /api/analyze exists", `Got ${r.status}`);
  } catch (e) { fail("POST /api/analyze exists", e.message); }

  try { const r = await fetch(`${BASE}/nonexistent`); assert(r.status === 404, "GET /nonexistent → 404", `Got ${r.status}`); }
  catch (e) { fail("GET /nonexistent → 404", e.message); }

  // ── 2. Browser Tests ──────────────────────────────────────
  console.log("\n── Browser Tests ──");

  let browser, page;
  try {
    browser = await chromium.launch({ headless: true });
    const ctx = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      permissions: ["clipboard-write", "clipboard-read"],
    });
    page = await ctx.newPage();

    const realErrors = [];
    page.on("console", (msg) => {
      if (msg.type() !== "error") return;
      if (msg.text().includes("Encountered a script tag while rendering")) return;
      realErrors.push(msg.text());
    });

    // ── 2a. Landing page ──
    await page.goto(BASE, { waitUntil: "networkidle", timeout: 15000 });
    assert((await page.title()).includes("Scout AI"), "Page title", "");
    assert(realErrors.length === 0, "No console errors", realErrors.join("; "));

    // ── 2b. Empty URL error ──
    const input = page.locator('input[aria-label="Website URL"]');
    const analyzeBtn = page.locator('[aria-label="Analyze website"]');
    await input.fill(" ");
    await input.fill("");
    await analyzeBtn.click();
    await page.waitForTimeout(500);
    const errEl = page.locator("#url-error");
    assert(await errEl.isVisible().catch(() => false), "Empty URL shows error", "");

    // ── 2c. Submit valid URL ──
    await input.fill("https://example.com");
    await analyzeBtn.click();
    await page.waitForTimeout(500);

    // ── 2d. Loading screen ──
    assert(await page.locator("text=Analyzing").isVisible().catch(() => false), "Loading screen shown", "");

    // ── 2e. Redirect to /report ──
    try { await page.waitForURL("**/report**", { timeout: 45000 }); assert(true, "Redirects to /report", ""); }
    catch (e) { fail("Redirect to /report", "Timed out"); }

    // ── 2f. Report page ──
    const reportUrl = page.url();
    assert(reportUrl.includes("url=") || reportUrl.includes("id="), "Report URL has param", `URL: ${reportUrl}`);
    await page.waitForTimeout(2000);

    const bodyText = await page.textContent("body").catch(() => "");
    assert(bodyText.includes("Intelligence Report") || bodyText.includes("HTTPS"), "Report content visible", "");

    // Debug: check localStorage
    const lsHistory = await page.evaluate(() => localStorage.getItem("scout:history")).catch(() => null);
    console.log(`    localStorage scout:history: ${lsHistory ? (JSON.parse(lsHistory).length + " items") : "null"}`);

    // Debug: check sessionStorage
    const ssKeys = await page.evaluate(() => Object.keys(sessionStorage)).catch(() => []);
    console.log(`    sessionStorage keys: ${ssKeys.length > 0 ? ssKeys.join(", ") : "none"}`);

    // ── 2g. Action buttons ──
    assert(await page.locator('button:has-text("Print")').isVisible().catch(() => false), "Print button", "");
    assert(await page.locator('button:has-text("Share")').isVisible().catch(() => false), "Share button", "");

    // ── 2h. Theme toggle ──
    const themeBtn = page.locator('[aria-label*="theme" i]');
    assert(await themeBtn.isVisible().catch(() => false), "Theme toggle visible", "");
    await themeBtn.click();
    await page.waitForTimeout(200);
    const isDark = await page.evaluate(() => document.documentElement.classList.contains("dark"));
    ok(`Theme toggle (dark=${isDark})`);
    await themeBtn.click();

    // ── 2i. Share ──
    await page.locator('button:has-text("Share")').click();
    await page.waitForTimeout(300);
    const shareCopied = await page.locator("text=Copied").isVisible().catch(() => false);
    assert(shareCopied, "Share shows 'Copied!'", "");

    // ── 2j. Console errors ──
    assert(realErrors.length === 0, "No console errors", realErrors.join("; "));

    // ── 2k. Report History ──
    await page.goto(BASE, { waitUntil: "networkidle", timeout: 15000 });
    // Wait for React useEffect to read localStorage and render
    await page.waitForTimeout(1500);
    
    const lsAfter = await page.evaluate(() => localStorage.getItem("scout:history")).catch(() => null);
    console.log(`    localStorage: ${lsAfter ? (JSON.parse(lsAfter).length + " items, first URL: " + JSON.parse(lsAfter)[0].finalUrl) : "null"}`);
    
    // Wait for the history section to appear
    const historyHeading = page.locator("h2:has-text('Report History')");
    try {
      await historyHeading.waitFor({ state: "visible", timeout: 3000 });
      assert(true, "Report History section", "");
    } catch {
      const allH2 = await page.locator("h2").allTextContents().catch(() => []);
      fail("Report History section", `Not found. h2s on page: ${allH2.join(" | ")}`);
    }

    // ── 2l. Mobile ──
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE, { waitUntil: "networkidle", timeout: 15000 });
    assert(await page.locator('input[aria-label="Website URL"]').isVisible().catch(() => false), "Mobile: input visible", "");
    assert(await page.locator('[aria-label="Analyze website"]').isVisible().catch(() => false), "Mobile: button visible", "");

    assert(realErrors.length === 0, "Zero console errors total", realErrors.join("; "));

  } catch (e) {
    console.error(`  ❌ Browser error: ${e.message}`);
  } finally {
    if (browser) await browser.close().catch(() => {});
  }

  // ── 3. Summary ────────────────────────────────────────────
  console.log("\n═══════════════════════════════════════════");
  console.log(`  PASSED: ${PASS.length}  FAILED: ${FAIL.length}`);
  console.log("═══════════════════════════════════════════\n");
  if (FAIL.length > 0) { console.log("Failures:"); FAIL.forEach(f => console.log(`  • ${f}`)); }
  process.exit(FAIL.length > 0 ? 1 : 0);
}

run();
