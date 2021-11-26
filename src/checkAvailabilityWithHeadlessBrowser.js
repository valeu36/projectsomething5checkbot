const puppeteer = require("puppeteer");
const parser = require("node-html-parser");
const utils = require("./utils");

const generateSitesData = () => {
  let totalSites = 1;
  const result = [];
  while (process.env["SITE_" + totalSites]) {
    let currentLine = process.env["SITE_" + totalSites];
    let fields = currentLine.split(";");
    result.push({ url: fields[fields.length - 2], buttonSelector: fields[fields.length - 1] });
    totalSites++;
  }
  return result;
};

const SITES_TO_CHECK = generateSitesData();
console.log("SITES_TO_CHECK :", SITES_TO_CHECK);

const checkBuyButtonSelector = async (site) => {
  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(site.url, { waitUntil: "networkidle2" });
    // await page.waitForSelector("main", { timeout: 3000 });
    await page.waitForSelector("main", { visible: true, timeout: 0 });

    const html = await page.evaluate(() => document.querySelector("html").innerHTML);
    const doc = parser.parse(html);
    const buyButton = doc.querySelector(site.buttonSelector);

    console.log({ buyButton });

    if (buyButton) {
      utils.sendUpdate({
        text: "Stock is available here " + site.url,
      });
    }

    await browser.close();
  } catch (e) {
    console.log(e);
  }
};

const runAvailabilityCheck = async () => {
  await Promise.all(
    SITES_TO_CHECK.map(async (site) => {
      return await checkBuyButtonSelector(site);
    })
  );
};

module.exports = { runAvailabilityCheck: runAvailabilityCheck };
