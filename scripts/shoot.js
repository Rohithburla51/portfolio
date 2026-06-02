// Headless screenshot tool using puppeteer-core + Edge
const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const OUT = path.resolve(__dirname, "..", ".preview");
const URL = process.argv[2] || "http://localhost:3000";
const NAME = process.argv[3] || "screenshot";

(async () => {
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: EDGE,
    headless: "shell",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1 },
  });
  const page = await browser.newPage();
  page.on("console", (m) => console.log("[page]", m.type(), m.text()));
  page.on("pageerror", (e) => console.log("[page error]", e.message));
  await page.goto(URL, { waitUntil: "networkidle2", timeout: 60000 });
  // let animations / fonts settle
  await new Promise((r) => setTimeout(r, 2000));

  // Full page
  await page.screenshot({
    path: path.join(OUT, `${NAME}-full.png`),
    fullPage: true,
  });
  console.log("saved", `${NAME}-full.png`);

  // Viewport (above the fold)
  await page.screenshot({
    path: path.join(OUT, `${NAME}-viewport.png`),
    fullPage: false,
  });
  console.log("saved", `${NAME}-viewport.png`);

  await browser.close();
  process.exit(0);
})().catch((e) => {
  console.error("FAIL:", e);
  process.exit(1);
});
