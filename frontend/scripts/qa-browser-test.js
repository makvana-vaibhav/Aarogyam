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
const BASE_URL = "https://aarogyam.vaibhavmakvana.in";

async function runQATests() {
  console.log("🚀 Starting Senior QA Browser Automated Test Suite on:", BASE_URL);
  
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
  });

  const page = await browser.newPage();
  const findings = [];

  try {
    // ----------------------------------------------------
    // TEST 1: Desktop Landing Page & Navigation (1280x800)
    // ----------------------------------------------------
    console.log("\n[TEST 1] Testing Desktop Landing Page (1280x800)...");
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(BASE_URL, { waitUntil: "networkidle2" });
    await page.screenshot({ path: path.join(screenshotsDir, "01_desktop_home.png") });

    const title = await page.title();
    console.log("  ✓ Page Title:", title);

    // Check desktop header action buttons
    const loginBtnVisible = await page.$eval(".header-actions a[href='/login']", el => !!el).catch(() => false);
    const registerBtnVisible = await page.$eval(".header-actions a[href='/register']", el => !!el).catch(() => false);
    console.log("  ✓ Desktop Header Login button:", loginBtnVisible ? "Found" : "Missing");
    console.log("  ✓ Desktop Header Register button:", registerBtnVisible ? "Found" : "Missing");

    // ----------------------------------------------------
    // TEST 2: Mobile Landing Page & Navigation (390x844)
    // ----------------------------------------------------
    console.log("\n[TEST 2] Testing Mobile Landing Page (390x844)...");
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.reload({ waitUntil: "networkidle2" });
    await page.screenshot({ path: path.join(screenshotsDir, "02_mobile_home.png") });

    const mobileLoginBtnDisplay = await page.$eval(".header-actions .btn-ghost", el => window.getComputedStyle(el).display).catch(() => "not-found");
    console.log("  ⚠️ Mobile Header Login button computed display:", mobileLoginBtnDisplay);
    if (mobileLoginBtnDisplay === "none") {
      findings.push("Mobile Header: Login button (.btn-ghost) is hidden via CSS `display: none` on mobile screens.");
    }

    // ----------------------------------------------------
    // TEST 3: Register Page (Patient & Doctor Forms)
    // ----------------------------------------------------
    console.log("\n[TEST 3] Testing Register Page (/register)...");
    await page.goto(`${BASE_URL}/register`, { waitUntil: "networkidle2" });
    await page.screenshot({ path: path.join(screenshotsDir, "03_register_patient_mobile.png") });

    // Check Password Eye toggle on patient form
    const patientPasswordEye = await page.$("#p-password ~ button, #p-password + .toggle-pass, .pass-eye-btn").catch(() => null);
    console.log("  ⚠️ Password Eye Toggle on Patient Register:", patientPasswordEye ? "Present" : "Missing");
    if (!patientPasswordEye) {
      findings.push("Register Page: No eye toggle button to unmask/show password on password fields.");
    }

    // Check Doctor Tab on Register
    console.log("  Clicking Doctor tab on Register...");
    await page.click("button[data-role='doctor']");
    await page.screenshot({ path: path.join(screenshotsDir, "04_register_doctor_mobile.png") });

    // Check Document fields (are they text inputs or file uploads?)
    const licenseDocType = await page.$eval("#d-licenseDoc", el => el.tagName + " " + el.type).catch(() => "not found");
    const degreeDocType = await page.$eval("#d-degreeDoc", el => el.tagName + " " + el.type).catch(() => "not found");
    console.log("  ⚠️ Doctor License Document field type:", licenseDocType);
    console.log("  ⚠️ Doctor Degree Document field type:", degreeDocType);
    if (licenseDocType.includes("text") || degreeDocType.includes("text")) {
      findings.push("Doctor Register: Document fields are raw text path inputs instead of PDF file upload.");
    }

    // Check Degree & Specialization dropdowns
    const degreesCount = await page.$$eval("#d-degree option", opts => opts.length).catch(() => 0);
    const specializationsCount = await page.$$eval("#d-specialization option", opts => opts.length).catch(() => 0);
    const specializationDisabled = await page.$eval("#d-specialization", el => el.disabled).catch(() => false);
    console.log(`  ✓ Degrees loaded: ${degreesCount} options`);
    console.log(`  ⚠️ Specializations loaded: ${specializationsCount} options (Disabled before degree selection: ${specializationDisabled})`);
    if (!specializationDisabled) {
      findings.push("Doctor Register: Specialization dropdown is enabled before degree is chosen and not filtered by degree.");
    }

    // ----------------------------------------------------
    // TEST 4: Patient Login & Patient Portal Testing
    // ----------------------------------------------------
    console.log("\n[TEST 4] Testing Patient Login (aarav.sharma@aarogyam.com)...");
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle2" });
    await page.type("#email", "aarav.sharma@aarogyam.com");
    await page.type("#password", "123456");
    await page.screenshot({ path: path.join(screenshotsDir, "05_login_filled.png") });
    
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle2" }).catch(() => {}),
      page.click("#loginSubmit")
    ]);
    await page.screenshot({ path: path.join(screenshotsDir, "06_patient_overview_mobile.png") });
    console.log("  ✓ Logged in as Patient. Current URL:", page.url());

    // Test Patient Medical History
    console.log("  Testing Medical History page...");
    await page.goto(`${BASE_URL}/patient/medical-history`, { waitUntil: "networkidle2" });
    await page.screenshot({ path: path.join(screenshotsDir, "07_patient_medical_history_mobile.png") });

    const visitCardsCount = await page.$$eval(".visit-card", cards => cards.length).catch(() => 0);
    console.log(`  ✓ Medical History: Found ${visitCardsCount} visit cards`);

    // Test Patient Reports
    console.log("  Testing Reports page...");
    await page.goto(`${BASE_URL}/patient/reports`, { waitUntil: "networkidle2" });
    await page.screenshot({ path: path.join(screenshotsDir, "08_patient_reports_mobile.png") });

    // Test Patient Profile
    console.log("  Testing Profile page...");
    await page.goto(`${BASE_URL}/patient/profile`, { waitUntil: "networkidle2" });
    await page.screenshot({ path: path.join(screenshotsDir, "09_patient_profile_mobile.png") });

    // Logout Patient
    console.log("  Logging out patient...");
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // ----------------------------------------------------
    // TEST 5: Doctor Login & Doctor Portal Testing
    // ----------------------------------------------------
    console.log("\n[TEST 5] Testing Doctor Login (dr.rajesh.varma@aarogyam.com)...");
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle2" });
    await page.type("#email", "dr.rajesh.varma@aarogyam.com");
    await page.type("#password", "123456");
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle2" }).catch(() => {}),
      page.click("#loginSubmit")
    ]);
    await page.screenshot({ path: path.join(screenshotsDir, "10_doctor_overview_mobile.png") });
    console.log("  ✓ Logged in as Doctor. Current URL:", page.url());

    // Switch to desktop viewport to check Desktop Doctor UI
    console.log("  Checking Doctor Desktop view (1280x800)...");
    await page.setViewport({ width: 1280, height: 800, isMobile: false, hasTouch: false });
    await page.reload({ waitUntil: "networkidle2" });
    await page.screenshot({ path: path.join(screenshotsDir, "11_doctor_overview_desktop.png") });

    const desktopScanQrBtn = await page.$("#topNavScanQrBtn, .nav-qr-btn").catch(() => null);
    console.log("  ⚠️ Scan QR button on Desktop Doctor TopNav:", desktopScanQrBtn ? "Present (Needs to be hidden on desktop)" : "Hidden");
    if (desktopScanQrBtn) {
      findings.push("Doctor Portal: 'Scan QR' button is visible on Desktop/Laptop view instead of mobile-only.");
    }

    // Check My Patients
    console.log("  Testing My Patients page...");
    await page.goto(`${BASE_URL}/doctor/my-patients`, { waitUntil: "networkidle2" });
    await page.screenshot({ path: path.join(screenshotsDir, "12_doctor_my_patients_desktop.png") });

    // Check Create Visit
    console.log("  Testing Create Visit page...");
    await page.goto(`${BASE_URL}/doctor/create-visit`, { waitUntil: "networkidle2" });
    await page.screenshot({ path: path.join(screenshotsDir, "13_doctor_create_visit_desktop.png") });

    console.log("\n✅ QA Automated Test Execution Completed Successfully!");

  } catch (err) {
    console.error("QA Test Error:", err);
  } finally {
    await browser.close();
  }

  console.log("\n================ QA AUDIT FINDINGS SUMMARY ================");
  findings.forEach((f, i) => console.log(`${i + 1}. ${f}`));
  console.log("===========================================================");
}

runQATests();
