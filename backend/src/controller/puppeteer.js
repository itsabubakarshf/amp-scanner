const puppeteer = require("puppeteer");
const fs = require("fs").promises;
const path = require('path');
const { JSDOM } = require('jsdom');
const logger = require('../utils/logger')
const ensureDirectoryExists = async (dirPath) => {
  try {
    await fs.mkdir(dirPath, { recursive: true });
    logger.info(`Directory ${dirPath} ensured to exist.`);
  } catch (error) {
    logger.error(`Error ensuring directory ${dirPath}: ${error.message}`);
  }
}
// Helper Functions
function generateDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function formatDateToPKT(date) {
  const offset = (date.getTimezoneOffset() * 60000) + (3600000 * 5); // PKT offset
  const pktDate = new Date(date.getTime() + offset);
  return pktDate.toISOString().replace('T', ' ').replace('Z', '') + ' PKT'; // Simplified PKT format
}
async function setupPage(browser) {
  const page = await browser.newPage();
  await page.setUserAgent("Mozilla/5.0 (Linux; Android 11; SM-G9910) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.181 Mobile Safari/537.36");
  await page.setViewport({ width: 412, height: 915 });
  return page;
}
async function navigateAndSearch(page, url, query) {
  url=`${url}/search?q=${query}`;
  console.log("updated URL = ",url)
  await page.goto(url);
  // await page.type(".gLFyf", query);
  await new Promise((resolve) => setTimeout(resolve, generateDelay(1500, 2000)));
  // await page.keyboard.press("Enter");
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
async function mainOperation(site = "superbahis.com", workerId, attempt = 1) {
  const dirPath = path.join(__dirname, 'htmlContent');
  await ensureDirectoryExists(dirPath);

  const filePath = path.join(dirPath, `loaded_content_${workerId}.html`);
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: process.platform === 'darwin'
      ? '/Applications/Chromium.app/Contents/MacOS/Chromium'
      : process.platform === 'linux'
        ? '/usr/bin/chromium-browser'
        : null,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  try {
    const page = await setupPage(browser);
    logger.info("Browser setup complete.");

    await navigateAndSearch(page, "https://google.com.tr", site);
    logger.info("Search completed.");

    // await page.waitForNavigation({ waitUntil: "networkidle0" });
    // logger.info("Page navigation finished.");
    await extractAndSaveContent(page, filePath);
    logger.info("Content saved.");
    await new Promise((resolve) => setTimeout(resolve, generateDelay(1000, 1500)));
    let extractedElement = await extractElementAndCleanup(page, "a[data-amp]", filePath);
    return extractedElement;
  } catch (error) {
    logger.error(`Attempt ${attempt}: ${error.message}`);
    if (attempt < 3) {
      await browser.close();
      logger.info(`Retrying... Attempt ${attempt + 1}`);
      await new Promise((resolve) => setTimeout(resolve, generateDelay(10000, 15000)));
      await mainOperation(site, workerId, attempt + 1);
    } else {
      logger.error("Max retries reached. Exiting...");
    }
  } finally {
    await browser.close();
    logger.info("Browser closed.");
  }
}

async function cleanupFile(filePath) {
  try {
    await fs.unlink(filePath);
    logger.info(`File ${filePath} deleted successfully.`);
  } catch (error) {
    logger.error(`Error deleting file ${filePath}: ${error.message}`);
  }
}

module.exports = mainOperation;