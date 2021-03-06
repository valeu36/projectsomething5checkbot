const parser = require("node-html-parser");
const fetch = require("node-fetch");
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

const runAvailabilityCheck = () => {
  SITES_TO_CHECK.forEach((site) => {
    fetch(site.url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36",
      },
    })
      .then((resp) => {
        if (!resp.ok) {
          console.error(resp.statusText + " Error while fetching " + site.url);
        }
        return resp.text();
      })
      .then((html) => {
        const doc = parser.parse(html);
        const buyButton = doc.querySelector(site.buttonSelector);
        console.log({ buyButton });
        if (buyButton) {
          utils.sendUpdate({
            text: "Stock is available here " + site.url,
          });
        }
      })
      .catch((e) => console.log(e));
  });
};

module.exports = { runAvailabilityCheck: runAvailabilityCheck };
