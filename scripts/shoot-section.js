// Section-specific screenshot using puppeteer
const puppeteer = require("puppeteer-core");
const path = require("path");

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const OUT = path.resolve(__dirname, "..", ".preview");
const URL = process.argv[2] || "http://localhost:3000";
const SECTION_ID = process.argv[3] || "projects";
const NAME = process.argv[4] || "section";

(async () => {
  const browser = await puppeteer.launch({
    executablePath: EDGE,
    headless: "shell",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 2 },
  });
  const page = await browser.newPage();
  await page.goto(URL, { waitUntil: "networkidle2", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 2500));

  // Scroll to the section, then screenshot just that section
  await page.evaluate((id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "instant", block: "start" });
  }, SECTION_ID);
  await new Promise((r) => setTimeout(r, 1500));

  // Fade-in elements have opacity 0 initially; force them visible
  await page.evaluate(() => {
    document.querySelectorAll("[style*='opacity:0']").forEach((el) => {
      (el).style.opacity = "1";
      (el).style.transform = "none";
    });
  });

  const el = await page.$(`#${SECTION_ID}`);
  if (el) {
    await el.screenshot({ path: path.join(OUT, `${NAME}.png`) });
    console.log("saved", `${NAME}.png`);
  } else {
    console.log("section not found");
  }
  await browser.close();
  process.exit(0);
})().catch((e) => { console.error("FAIL:", e); process.exit(1); });
