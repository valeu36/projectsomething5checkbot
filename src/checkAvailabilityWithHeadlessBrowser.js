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

const checkBuyButtonSelector = async (site, browser) => {
  try {
    const page = await browser.newPage();
    await page.goto(site.url, { waitUntil: "networkidle2" });
    await page.waitForSelector("body", { visible: true, timeout: 0 });

    const html = await page.evaluate(() => document.querySelector("html").innerHTML);

    const doc = parser.parse(html);
    const buyButton = doc.querySelector(site.buttonSelector);

    if (buyButton) {
      utils.sendUpdate({
        text: "Stock is available here: " + site.url,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

const runAvailabilityCheck = async () => {
  const browser = await puppeteer.launch();
  const promised = SITES_TO_CHECK.map((site) => checkBuyButtonSelector(site, browser));
  await Promise.all(promised);
  browser.close();
};

module.exports = { runAvailabilityCheck: runAvailabilityCheck };
