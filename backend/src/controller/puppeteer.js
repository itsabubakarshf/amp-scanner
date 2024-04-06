const puppeteer = require("puppeteer");
const fs = require("fs").promises;

// Helper Functions
function generateDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatDateToPKT(date) {
  const offset = (date.getTimezoneOffset() * 60000) + (3600000 * 5); // PKT offset
  const pktDate = new Date(date.getTime() + offset);
  return pktDate.toISOString().replace('T', ' ').replace('Z', '') + ' PKT'; // Simplified PKT format
}

const logger = {
  info: (msg) => console.log(`[${formatDateToPKT(new Date())}] INFO: ${msg}`),
  error: (msg) => console.error(`[${formatDateToPKT(new Date())}] ERROR: ${msg}`),
};

async function setupPage(browser) {
  const page = await browser.newPage();
  await page.setUserAgent("Mozilla/5.0 (Linux; Android 10; Samsung Galaxy S20 Ultra) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.152 Mobile Safari/537.36");
  await page.setViewport({ width: 412, height: 915 });
  return page;
}

async function navigateAndSearch(page, url, query) {
  await page.goto(url);
  await page.type(".gLFyf", query);
  await new Promise((resolve) => setTimeout(resolve, generateDelay(3000, 5000)));
  await page.keyboard.press("Enter");
}

async function extractAndSaveContent(page, filePath) {
  const content = await page.content();
  await fs.writeFile(filePath, content);
}

async function extractElementAndCleanup(page, selector, filePath) {
  const elementHTML = await page.evaluate((sel) => {
    const element = document.querySelector(sel);
    return element ? element.outerHTML : null;
  }, selector);
  
  if (elementHTML) {
    logger.info(`Element has been extracted`);
    await fs.unlink(filePath);
    logger.info("Temporary file deleted.");
    return elementHTML;
  } else {
    throw new Error("Element not found.");
  }
}

async function mainOperation(site="superbahis.com",attempt = 1) {
  const browser = await puppeteer.launch({headless:false});
  try {
    const page = await setupPage(browser);
    logger.info("Browser setup complete.");

    await navigateAndSearch(page, "https://google.com.tr", site);
    logger.info("Search completed.");

    await page.waitForNavigation({ waitUntil: "networkidle0" });
    logger.info("Page navigation finished.");

    const filePath = "./loaded_content.html";
    await extractAndSaveContent(page, filePath);
    logger.info("Content saved.");
    await new Promise((resolve) => setTimeout(resolve, generateDelay(3000, 5000)));
    let extractedElement=await extractElementAndCleanup(page, "a[data-amp]", filePath);
    return extractedElement;
  } catch (error) {
    logger.error(`Attempt ${attempt}: ${error.message}`);
    if (attempt < 3) {
      logger.info(`Retrying... Attempt ${attempt + 1}`);
      await new Promise((resolve) => setTimeout(resolve, generateDelay(20000, 30000)));
      await mainOperation(attempt + 1);
    } else {
      logger.error("Max retries reached. Exiting...");
    }
  } finally {
    await browser.close();
    logger.info("Browser closed.");
  }
}
module.exports = mainOperation;