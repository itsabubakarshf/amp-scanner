const express = require("express");
const { z } = require("zod");
const cors = require("cors");
const { JSDOM } = require("jsdom");
const mainOperation = require("./controller/puppeteer");
const fs = require("fs");
const path = require("path");

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
// Function to update live.json with the response data
async function updateLiveJson(responseData) {
  let liveData = [];

  // Check if live.json exists and read its content
  if (fs.existsSync(liveJsonPath)) {
    const rawLiveData = fs.readFileSync(liveJsonPath, "utf-8");
    if (rawLiveData) {
      liveData = JSON.parse(rawLiveData);
    }
  }

  // Add the new response data
  liveData.push(responseData);

  // Filter out data older than 24 hours
  const currentTime = Date.now();
  liveData = liveData.filter(
    (data) =>
      currentTime - new Date(data.timestamp).getTime() <= 24 * 60 * 60 * 1000
  );

  // Write the updated data back to live.json
  fs.writeFileSync(liveJsonPath, JSON.stringify(liveData, null, 2));
}

// API that receives data and sends it to a controller
app.post("/process-data", async (req, res) => {
  try {
    console.log(liveJsonPath)
    console.log(req.body);
    const validatedData = inputDataSchema.parse(req.body);
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
    await updateLiveJson(result);
    const updatedLiveData = fs.readFileSync(liveJsonPath, "utf-8");
    const liveJson = JSON.parse(updatedLiveData);
    result.liveData = liveJson;
    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ errors: error.errors });
    } else {
      console.error(error);
      res.status(500).send("An unexpected error occurred.");
    }
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
