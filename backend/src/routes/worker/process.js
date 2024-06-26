const express = require('express');
const app = express();
const Worker = require('../../models/worker/worker');
const ProcessedResult = require('../../models/worker/results')
const auth = require('../../config/auth')
const logger = require('../../utils/logger')
const { JSDOM } = require("jsdom");
const mainOperation = require("../../controller/puppeteer");
const { z } = require("zod");
const { startWorkerProcess, stopWorkerProcess, stoppedWorkers } = require('../../services/workerProcess')


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

app.get("/get-latest-worker-results", auth, async (req, res) => {
  try {
    const results = await ProcessedResult.aggregate([
      { $match: { userId: req.user._id } }, 
      { 
        $sort: { timestamp: -1 } 
      },
      { 
        $group: {
          _id: "$workerId", 
          latestResult: { $first: "$$ROOT" }  
        }
      },
      { 
        $replaceRoot: { newRoot: "$latestResult" }
      }
    ]);

    if (results.length > 0) {
      res.json({ status: true, data: results });
    } else {
      res.status(404).json({ status: false, message: "No results found" });
    }
  } catch (error) {
    logger.error("Failed to fetch latest worker results:", error);
    res.status(500).send("An unexpected error occurred.");
  }
});

//load data
app.post('/load-data',auth,async (req, res) => {
    const { siteName } = req.body;
    try {
      if (!siteName) {
       return res.status(500).send({status:false,message:"SiteName is required"});
      }
      let data =await  loadDate(siteName,req.user._id)

      if (!data) {
        return res.status(404).json({ status: false, message: "No data found for the specified siteName" });
      }

      res.json({ status: true, data });
    } catch (error) {
      logger.error("Failed to load data:", error.message);
      res.status(500).send({status:false,message:error.message});
    }
  }
);

//Start or stop the worker
app.post("/update-process/:id", auth, async (req, res) => {
  const workerId = req.params.id;
  try {
      const worker = await Worker.findById(workerId);
      if (!worker) {
          return res.status(404).send("Worker not found.");
      }

      if (worker.isRunning) {
        logger.info(`Worker ${workerId} stopped for user ${req.user.email}`);
        stopWorkerProcess(workerId);
        await Worker.findByIdAndUpdate(workerId, { isRunning: false });
        res.status(200).json({ status: true, message: `Processing stopped for worker ${workerId}` });
      } else {
        logger.info(`Worker ${workerId} started for user ${req.user.email}`);
        stoppedWorkers.delete(workerId);
        const interval = parseInt(worker.interval, 10);
        startWorkerProcess(workerId, async () => {
          logger.info(`Processing data for worker ${workerId}`);
          await processData(worker, req.user._id);
        }, interval);
        await Worker.findByIdAndUpdate(workerId, { isRunning: true });
        res.status(200).json({ status: true, message: `Processing started for worker ${workerId}` });
      }
  } catch (error) {
      logger.error("Error in processing worker:", error);
      res.status(500).json({ status: false, message: error.message });
  }
});



async function processData(worker, userId) {
  try {
    // Use mainOperation to simulate fetching data
    let extractedData = await mainOperation(worker.siteName, worker._id, 1);

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


async function loadDate(siteName, userId) {
  try {
    // Use mainOperation to simulate fetching data
    let extractedData = await mainOperation(siteName, userId, 1);

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
      return extractedData
    } else {
      throw new Error("Anchor tag not found in the extracted data for this site")
    }
  } catch (error) {
    logger.error(`Error during operation for this site: ${error.message}`);
    throw new Error(`Error during operation for this site: ${error.message}`)
  }
}
function normalizeUrl(url) {
  // Remove trailing slash if it exists
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

function prepareResult(worker, extractedData) {
  let result = {
    success: true,
    message: "All attributes are equal to the extracted data.",
    extractedData: extractedData
  };
  // Normalize URLs before comparison
  const normalizedWorkerDataAmpUrl = normalizeUrl(worker.dataAmpUrl);
  const normalizedExtractedDataAmpUrl = normalizeUrl(extractedData["data-amp"]);
  const normalizedWorkerDataAmpCurrent = normalizeUrl(worker.dataAmpCurrent);
  const normalizedExtractedDataAmpCurrent = normalizeUrl(extractedData["data-amp-cur"]);
  const normalizedWorkerDataAmpTitle = normalizeUrl(worker.dataAmpTitle);
  const normalizedExtractedDataAmpTitle = normalizeUrl(extractedData["data-amp-title"]);
  const normalizedWorkerHref = normalizeUrl(worker.href);
  const normalizedExtractedHref = normalizeUrl(extractedData.href);

  // Check each attribute
  if (normalizedWorkerDataAmpUrl !== normalizedExtractedDataAmpUrl) {
    result = {
      success: false,
      message: "'data-amp' is different from the extracted data.",
      extractedData
    };
  } else if (normalizedWorkerDataAmpCurrent !== normalizedExtractedDataAmpCurrent) {
    result = {
      success: false,
      message: "'data-amp-cur' is different from the extracted data.",
      extractedData
    };
  } else if (normalizedWorkerDataAmpTitle !== normalizedExtractedDataAmpTitle) {
    result = {
      success: false,
      message: "'data-amp-title' is different from the extracted data.",
      extractedData
    };
  } else if (normalizedWorkerHref !== normalizedExtractedHref) {
    result = {
      success: false,
      message: "'href' is different from the extracted data.",
      extractedData
    };
  }

  return result;
}

const initializeRunningWorkers = async () => {
  try {
    const runningWorkers = await Worker.find({ isRunning: true });
    runningWorkers.forEach(worker => {
      const interval = parseInt(worker.interval, 10);
      startWorkerProcess(worker._id, async () => {
        logger.info(`Processing data for worker ${worker._id}`);
        await processData(worker, worker.user);
      }, interval);
    });
  } catch (error) {
    logger.error("Error initializing running workers:", error);
  }
};


initializeRunningWorkers()
module.exports = app