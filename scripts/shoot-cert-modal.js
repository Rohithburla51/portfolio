// Screenshot the certificate modal in its open state.
// Usage: node scripts/shoot-cert-modal.js [cert-pdf-url] [output-name]
// Default: opens the first cert card and screenshots the modal.
const puppeteer = require("puppeteer-core");
const path = require("path");

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const OUT = path.resolve(__dirname, "..", ".preview");
const URL = process.argv[2] || "http://localhost:3000";
const NAME = process.argv[3] || "cert-modal";

(async () => {
  const browser = await puppeteer.launch({
    executablePath: EDGE,
    headless: "shell",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 2 },
  });
  const page = await browser.newPage();
  page.on("pageerror", (e) => console.log("[page error]", e.message));
  await page.goto(URL, { waitUntil: "networkidle2", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 2000));

  // Scroll to certifications section
  await page.evaluate(() => {
    const el = document.getElementById("certifications");
    if (el) el.scrollIntoView({ behavior: "instant", block: "start" });
  });
  await new Promise((r) => setTimeout(r, 1500));

  // Force all fade-in elements visible
  await page.evaluate(() => {
    document.querySelectorAll("[style*='opacity:0']").forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
  });

  // Click the first "View" button
  const clicked = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("span"));
    const view = buttons.find((b) => b.textContent && b.textContent.trim().startsWith("View"));
    if (view) {
      const parent = view.closest("span[class*='cursor-pointer']") || view.parentElement;
      (parent || view).click();
      return true;
    }
    return false;
  });
  console.log("clicked view:", clicked);
  await new Promise((r) => setTimeout(r, 1500));

  // Screenshot full viewport (modal is centered, full-screen overlay)
  await page.screenshot({
    path: path.join(OUT, `${NAME}.png`),
    fullPage: false,
  });
  console.log("saved", `${NAME}.png`);

  await browser.close();
  process.exit(0);
})().catch((e) => {
  console.error("FAIL:", e);
  process.exit(1);
});
