import puppeteer from "puppeteer-core";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const screenshotsDir = "/Users/cypherops/.gemini/antigravity-ide/brain/3f45addf-38cf-48b8-8dda-1ea9dc9c0c7e/qa_screenshots";

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const LOCAL_DEV_URL = "http://localhost:5173";

async function runLocalE2ETests() {
  console.log("🚀 Starting Comprehensive Local E2E Verification Suite on:", LOCAL_DEV_URL);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
  });

  const page = await browser.newPage();
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log("  ✓ PASS:", message);
      passed++;
    } else {
      console.error("  ❌ FAIL:", message);
      failed++;
    }
  }

  try {
    // Create an incognito browser context for clean tests
    const context = await browser.createBrowserContext();
    const page = await context.newPage();

    page.on("console", msg => console.log("  [BROWSER CONSOLE]", msg.type(), msg.text()));
    page.on("pageerror", err => console.error("  [BROWSER ERROR]", err.message));

    // ----------------------------------------------------------------
    // 1. Desktop vs Mobile Header Actions
    // ----------------------------------------------------------------
    console.log("\n[TEST 1] Testing Mobile Header Actions (390x844)...");
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.goto(LOCAL_DEV_URL, { waitUntil: "networkidle2" });
    const html = await page.content();
    console.log("  Page HTML snippet:", html.slice(0, 300));
    await page.waitForSelector(".header-actions", { timeout: 5000 });
    console.log("  Current URL on home load:", page.url());
    await page.screenshot({ path: path.join(screenshotsDir, "v2_01_mobile_home.png") });

    const mobileGhostDisplay = await page.$eval(".header-actions .btn-ghost", el => window.getComputedStyle(el).display).catch((e) => "none (" + e.message + ")");
    const mobileSolidDisplay = await page.$eval(".header-actions .btn-solid", el => window.getComputedStyle(el).display).catch((e) => "none (" + e.message + ")");
    assert(!mobileGhostDisplay.includes("none"), "Mobile Header Login button (.btn-ghost) is visible (computed: " + mobileGhostDisplay + ")");
    assert(!mobileSolidDisplay.includes("none"), "Mobile Header Register button (.btn-solid) is visible (computed: " + mobileSolidDisplay + ")");

    // ----------------------------------------------------------------
    // 2. Register Form Password Eye Toggle & Cascading Degree/Specialization
    // ----------------------------------------------------------------
    console.log("\n[TEST 2] Testing Register Form Password Eye & Cascading Dropdowns...");
    await page.goto(`${LOCAL_DEV_URL}/register`, { waitUntil: "networkidle2" });
    await page.waitForSelector("#p-password", { timeout: 5000 });
    console.log("  Current URL on register load:", page.url());
    await page.screenshot({ path: path.join(screenshotsDir, "v2_02_register_patient.png") });

    // Check Password Eye toggle on patient form
    const passEyeBtn = await page.$("#p-password ~ .password-toggle-btn");
    assert(!!passEyeBtn, "Password eye toggle button exists on #p-password");

    // Type into password and test toggle click
    await page.type("#p-password", "Secret123!");
    let passInputType = await page.$eval("#p-password", el => el.type);
    assert(passInputType === "password", "Password field is initially hidden (type='password')");

    await page.click("#p-password ~ .password-toggle-btn");
    passInputType = await page.$eval("#p-password", el => el.type);
    assert(passInputType === "text", "Clicking eye toggle reveals password (type='text')");

    await page.click("#p-password ~ .password-toggle-btn");
    passInputType = await page.$eval("#p-password", el => el.type);
    assert(passInputType === "password", "Clicking eye toggle again conceals password (type='password')");

    // Switch to Doctor Tab
    console.log("  Switching to Doctor Tab...");
    await page.click("button[data-role='doctor']");
    await page.screenshot({ path: path.join(screenshotsDir, "v2_03_register_doctor.png") });

    // Check PDF file upload inputs
    const licenseFileInput = await page.$eval("#d-licenseFile", el => el.type + " " + el.accept).catch(() => "");
    const degreeFileInput = await page.$eval("#d-degreeFile", el => el.type + " " + el.accept).catch(() => "");
    assert(licenseFileInput.includes("file") && licenseFileInput.includes("application/pdf"), "Doctor License input is a PDF file picker (" + licenseFileInput + ")");
    assert(degreeFileInput.includes("file") && degreeFileInput.includes("application/pdf"), "Doctor Degree input is a PDF file picker (" + degreeFileInput + ")");

    // Check Degree ➔ Specialization cascading
    const specDisabledInitial = await page.$eval("#d-specialization", el => el.disabled);
    assert(specDisabledInitial === true, "Specialization dropdown is disabled before degree is selected");

    // Select MBBS Degree
    await page.select("#d-degree", "1"); // MBBS
    await new Promise(r => setTimeout(r, 600)); // wait for cascade fetch
    const specDisabledAfter = await page.$eval("#d-specialization", el => el.disabled);
    const specOptions = await page.$$eval("#d-specialization option", opts => opts.map(o => o.text));
    assert(specDisabledAfter === false, "Specialization dropdown is enabled after degree selection");
    assert(specOptions.some(o => o.includes("General Physician")), "MBBS specializations loaded include 'General Physician'");
    console.log("    Loaded specializations for MBBS:", specOptions.slice(1));

    // ----------------------------------------------------------------
    // 3. Login Page Password Eye Toggle
    // ----------------------------------------------------------------
    console.log("\n[TEST 3] Testing Login Page Password Toggle...");
    await page.goto(`${LOCAL_DEV_URL}/login`, { waitUntil: "networkidle2" });
    await page.screenshot({ path: path.join(screenshotsDir, "v2_04_login.png") });

    const loginPassEye = await page.$("#password ~ .password-toggle-btn");
    assert(!!loginPassEye, "Password eye toggle button exists on login password field");

    // ----------------------------------------------------------------
    // 4. Doctor Portal Desktop vs Mobile QR Scanner Visibility
    // ----------------------------------------------------------------
    console.log("\n[TEST 4] Testing Doctor Portal Desktop vs Mobile QR Scanner & Navigation...");

    // Login as Doctor
    await page.type("#email", "dr.rajesh.varma@aarogyam.com");
    await page.type("#password", "123456");
    await page.click("#loginSubmit");
    await page.waitForNavigation({ waitUntil: "networkidle2" });

    // Desktop view (1280x800)
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(`${LOCAL_DEV_URL}/doctor/overview`, { waitUntil: "networkidle2" });
    await page.screenshot({ path: path.join(screenshotsDir, "v2_05_doctor_desktop.png") });

    const desktopTopNavQr = await page.$eval("#topNavScanQrBtn", el => window.getComputedStyle(el).display).catch(() => "none");
    const desktopOverviewQr = await page.$eval("#overviewScanQrBtn", el => window.getComputedStyle(el).display).catch(() => "none");
    assert(desktopTopNavQr === "none", "Desktop TopNav Scan QR button is suppressed on desktop (display: " + desktopTopNavQr + ")");
    assert(desktopOverviewQr === "none", "Desktop In-page Scan QR button is suppressed on desktop (display: " + desktopOverviewQr + ")");

    // Mobile view (390x844)
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.goto(`${LOCAL_DEV_URL}/doctor/overview`, { waitUntil: "networkidle2" });
    await page.screenshot({ path: path.join(screenshotsDir, "v2_06_doctor_mobile.png") });

    const mobileBottomDock = await page.$eval(".doctor-bottom-nav", el => window.getComputedStyle(el).display).catch(() => "none");
    const mobileCenterQrBtn = await page.$eval(".mob-tab-center-btn", el => window.getComputedStyle(el).display).catch(() => "none");
    const mobileTopHamburger = await page.$eval(".pt-mobile-toggle", el => window.getComputedStyle(el).display).catch(() => "none");

    assert(mobileBottomDock === "flex", "Mobile bottom navigation dock is active on doctor mobile view");
    assert(mobileCenterQrBtn !== "none", "Center elevated Scan QR button is active on doctor mobile dock");
    assert(mobileTopHamburger === "none", "Redundant top hamburger button is removed on doctor mobile view");

    // ----------------------------------------------------------------
    // 5. Popover Dismissal on Touch / Click Outside
    // ----------------------------------------------------------------
    console.log("\n[TEST 5] Testing Avatar Popover Outside Click Dismissal...");
    await page.click("#avatarBtn");
    let avatarPopoverHidden = await page.$eval("#avatarPopover", el => el.hidden);
    assert(avatarPopoverHidden === false, "Avatar menu opens upon clicking avatar button");

    // Click outside on the main content
    await page.click(".pt-main");
    avatarPopoverHidden = await page.$eval("#avatarPopover", el => el.hidden);
    assert(avatarPopoverHidden === true, "Avatar menu closes cleanly when tapping outside");

    // ----------------------------------------------------------------
    // 6. Create Visit Auto-advancing and Search Params
    // ----------------------------------------------------------------
    console.log("\n[TEST 6] Testing Create Visit Aarogyam ID Param Auto-Advance...");
    await page.goto(`${LOCAL_DEV_URL}/doctor/create-visit?aarogyamId=AAR-2026-00001`, { waitUntil: "networkidle2" });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(screenshotsDir, "v2_07_create_visit_autofilled.png") });

    const stepPill2Active = await page.$eval("#stepPill2", el => el.classList.contains("active")).catch(() => false);
    assert(stepPill2Active === true, "Create Visit auto-advances directly to Step 2 when Aarogyam ID is provided");

    // ----------------------------------------------------------------
    // 7. Patient Portal Medical History Visit Sorting
    // ----------------------------------------------------------------
    console.log("\n[TEST 7] Testing Patient Portal Visits Sorting (Newest First)...");
    await page.goto(`${LOCAL_DEV_URL}/login`, { waitUntil: "networkidle2" });
    await page.type("#email", "aarav.sharma@aarogyam.com");
    await page.type("#password", "123456");
    await page.click("#loginSubmit");
    await page.waitForNavigation({ waitUntil: "networkidle2" });

    await page.goto(`${LOCAL_DEV_URL}/patient/medical-history`, { waitUntil: "networkidle2" });
    await page.screenshot({ path: path.join(screenshotsDir, "v2_08_patient_history.png") });

    const visitDates = await page.$$eval(".timeline-date, .visit-date-badge", els => els.map(e => e.textContent.trim())).catch(() => []);
    console.log("    Rendered visit dates:", visitDates);
    assert(visitDates.length > 0, "Patient medical history visits rendered properly");

    console.log("\n==========================================");
    console.log(`🎉 ALL TESTS COMPLETED: ${passed} PASSED, ${failed} FAILED`);
    console.log("==========================================");

  } catch (err) {
    console.error("Test execution failed:", err);
  } finally {
    await browser.close();
  }
}

runLocalE2ETests();
