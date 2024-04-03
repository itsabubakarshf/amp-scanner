const express = require("express");
const { z } = require("zod");
const cors = require("cors");
const { JSDOM } = require("jsdom");
const mainOperation = require("./controller/puppeteer");
const fs = require("fs");
const path = require("path");

let processingIntervalId = null;


const inputDataSchema = z.object({
  "data-amp": z
    .string()
    .min(1, { message: "Please provide a value for 'data-amp'." }),
  "data-amp-cur": z
    .string()
    .min(1, { message: "Please provide a value for 'data-amp-cur'." }),
  "data-amp-title": z
    .string()
    .min(1, { message: "Please provide a value for 'data-amp-title'." }),
  site: z.string().min(1, { message: "Please provide a value for 'site'." }),
  href: z
    .string()
    .url()
    .min(1, { message: "Please provide a valid URL for 'href'." }),
});

const app = express();
const port = 3000;

let corsOptions = {
  origin: "*",
};

app.use(cors(corsOptions));

app.use(express.json());

let liveJsonPath = path.join(__dirname, "..", "live.json");

// API to check if the server is running
app.get("/health-check", (req, res) => {
  res.send("Server is running!");
});
async function updateLiveJson(responseData) {
  try {
    let liveData = [];

    // Check if live.json exists
    if (fs.existsSync(liveJsonPath)) {
      const rawLiveData = fs.readFileSync(liveJsonPath, "utf-8");
      // Check if the file is not empty or does not contain 'null'
      if (rawLiveData && rawLiveData.trim() !== '' && rawLiveData.trim().toLowerCase() !== 'null') {
        liveData = JSON.parse(rawLiveData);
      }
      // If the file is empty or contains 'null', liveData remains an empty array
    }
    // Else, the file doesn't exist, and liveData is already initialized as an empty array

    // Append new responseData
    liveData.push(responseData);

    // Filter out data older than 24 hours
    const currentTime = Date.now();
    liveData = liveData.filter(
      data => currentTime - new Date(data.timestamp).getTime() <= 24 * 60 * 60 * 1000
    );

    // Write the updated data back to live.json, creating the file if it doesn't exist
    fs.writeFileSync(liveJsonPath, JSON.stringify(liveData, null, 2));
  } catch (error) {
    console.error("Failed to update live.json:", error);
    // Consider how you want to handle the error. Re-throw it, return it, etc.
  }
}


app.get("/get-latest-results", async (req, res) => {
  try {
    // Check if the file exists and is not empty
    if (fs.existsSync(liveJsonPath) && fs.statSync(liveJsonPath).size > 0) {
      const resultsData = fs.readFileSync(liveJsonPath, "utf-8");
      const results = JSON.parse(resultsData);
      res.json({ success: true, results });
    } else {
      // If the file doesn't exist or is empty, return an empty array
      res.json({ success: true, results: [] });
    }
  } catch (error) {
    console.error("An error occurred while fetching results:", error);
    res.status(500).send("An unexpected error occurred.");
  }
});


app.get("/stop-process", (req, res) => {
  if (processingIntervalId) {
    clearInterval(processingIntervalId);
    processingIntervalId = null; // Reset the interval ID
    res.send("Processing stopped.");
  } else {
    res.send("No processing was running.");
  }
});
app.post("/process-data", async (req, res) => {
  // Perform initial validation before starting the background process
  try {
      const validatedData = inputDataSchema.parse(req.body);
      // If validation passes and no interval is running, start the process
      if (!processingIntervalId) {
          // Respond immediately to indicate the process has started
          res.json({ message: "Periodic processing started." });

          processingIntervalId = setInterval(async () => {
              try {
                  // Since validation passed earlier, we proceed with assuming data is valid here
                  let extractedData = await mainOperation(validatedData.site, 1);
                  const dom = new JSDOM(extractedData);
                  const anchor = dom.window.document.querySelector("a");
                  extractedData = {
                      "data-amp": anchor.getAttribute("data-amp"),
                      "data-amp-cur": anchor.getAttribute("data-amp-cur"),
                      "data-amp-title": anchor.getAttribute("data-amp-title"),
                      href: anchor.getAttribute("href"),
                  };
                  for (let key in extractedData) {
                    if (extractedData[key] && extractedData[key].endsWith("/")) {
                      extractedData[key] = extractedData[key].slice(0, -1);
                    }
                  }
              
                  for (let key in validatedData) {
                    if (validatedData[key] && validatedData[key].endsWith("/")) {
                      validatedData[key] = validatedData[key].slice(0, -1);
                    }
                  }
                  let result = {
                    success: true,
                    message: "All attributes are equal to the extracted data.",
                    extractedData,
                    timestamp: new Date().toISOString(),
                  };
                  if (validatedData["data-amp"] !== extractedData["data-amp"]) {
                    result = {
                      success: false,
                      message: `'data-amp' is different from the extracted data.`,
                      extractedData,
                      timestamp: new Date().toISOString(),
                    };
                  } else if (
                    validatedData["data-amp-cur"] !== extractedData["data-amp-cur"]
                  ) {
                    result = {
                      success: false,
                      message: `'data-amp-cur' is different from the extracted data.`,
                      extractedData,
                      timestamp: new Date().toISOString(),
                    };
                  } else if (
                    validatedData["data-amp-title"] !== extractedData["data-amp-title"]
                  ) {
                    result = {
                      success: false,
                      message: `'data-amp-title' is different from the extracted data.`,
                      extractedData,
                      timestamp: new Date().toISOString(),
                    };
                  } else if (validatedData.href !== extractedData.href) {
                    result = {
                      success: false,
                      message: `'href' is different from the extracted data.`,
                      extractedData,
                      timestamp: new Date().toISOString(),
                    };
                  }

                  // Consider saving the results to a file, database, or other persistent storage
                  await updateLiveJson(result);
              } catch (error) {
                  // Log the error, but since we can't send an HTTP response here, consider other ways to notify about the error
                  console.error("Error during periodic processing:", error);
              }
          }, 2 * 60 * 1000); // Interval set to 1 minute for demonstration
      } else {
          // If an interval is already running, inform the requester
          res.json({ message: "Processing is already running." });
      }
  } catch (error) {
      if (error instanceof z.ZodError) {
          // If validation fails, immediately return an error response
          res.status(400).json({ errors: error.errors });
      } else {
          // Handle other unexpected errors
          console.error("An unexpected error occurred:", error);
          res.status(500).send("An unexpected error occurred.");
      }
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});



