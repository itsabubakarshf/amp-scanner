const express = require('express');
const app = express();
const Worker = require('../../models/worker/worker');
const ProcessedResult = require('../../models/worker/results')
const auth = require('../../config/auth')
const logger = require('../../utils/logger')
const { JSDOM } = require("jsdom");
const mainOperation = require("../../controller/puppeteer");
const { z } = require("zod");
const { startWorkerProcess, stopWorkerProcess } = require('../../services/workerProcess')


app.get("/get-latest-results/:workerId", auth, async (req, res) => {
  const { workerId } = req.params;
  try {
    const results = await ProcessedResult.find({ workerId: workerId, userId: req.user._id }).sort({ timestamp: -1 }).limit(30);
    if (results.length > 0) {
      res.json({ status: true, data: results });
    } else {
      res.status(404).json({ status: true, data: results });
    }
  } catch (error) {
    logger.error("Failed to fetch results:", error);
    res.status(500).send("An unexpected error occurred.");
  }
});

//Start or stop the worker
app.post("/update-process/:id", auth, async (req, res) => {
  const workerId = req.params.id;
  try {
    const worker = await Worker.findById(workerId);
    if (!worker) {
      return res.status(404).send("Worker not found.");
    }

    if (worker.isRunning) {
      stopWorkerProcess(workerId);
      await Worker.findByIdAndUpdate(workerId, { isRunning: false });
      res.status(200).json({ status: true, message: "Processing stopped for worker " + workerId });
    } else {
      startWorkerProcess(workerId, async () => {
        logger.info(`Processing data for worker ${workerId}`);
        await processData(worker, req.user._id);
      }, worker.interval);

      await Worker.findByIdAndUpdate(workerId, { isRunning: true });
      res.status(200).json({ status: true, message: "Processing started for worker " + workerId });
    }
  } catch (error) {
    logger.error("Error in processing worker:", error);
    res.status(500).json({ status: false, message: `${error.message}` });
  }
});

async function processData(worker, userId) {
  try {
    // Use mainOperation to simulate fetching data
    let extractedData = await mainOperation(worker.siteName, 1);

    // Process and compare the data as in your original endpoint logic
    const dom = new JSDOM(extractedData);
    const anchor = dom.window.document.querySelector("a");
    if (anchor) {
      extractedData = {
        "data-amp": anchor.getAttribute("data-amp"),
        "data-amp-cur": anchor.getAttribute("data-amp-cur"),
        "data-amp-title": anchor.getAttribute("data-amp-title"),
        href: anchor.getAttribute("href"),
      };

      let result = prepareResult(worker, extractedData);

      const processedResult = new ProcessedResult({
        workerId: worker._id,
        userId: userId,
        success: result.success,
        message: result.message,
        data: result.extractedData,
        timestamp: new Date()
      });

      await processedResult.save();
      logger.info("Processed data saved for worker " + worker._id);
    } else {
      logger.error("Anchor tag not found in the extracted data for worker " + worker._id);
    }
  } catch (error) {
    logger.error("Error during operation for worker " + worker._id + ": ", error);
  }
}
function prepareResult(worker, extractedData) {
  let result = {
    success: true,
    message: "All attributes are equal to the extracted data.",
    extractedData: extractedData
  };

  // Check each attribute
  if (worker.dataAmpUrl !== extractedData["data-amp"]) {
    result = {
      success: false,
      message: "'data-amp' is different from the extracted data.",
      extractedData
    };
  } else if (worker.dataAmpCurrent !== extractedData["data-amp-cur"]) {
    result = {
      success: false,
      message: "'data-amp-cur' is different from the extracted data.",
      extractedData
    };
  } else if (worker.dataAmpTitle !== extractedData["data-amp-title"]) {
    result = {
      success: false,
      message: "'data-amp-title' is different from the extracted data.",
      extractedData
    };
  } else if (worker.href !== extractedData.href) {
    result = {
      success: false,
      message: "'href' is different from the extracted data.",
      extractedData
    };
  }

  return result;
}
module.exports = app