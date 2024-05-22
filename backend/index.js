require('dotenv').config();
const express = require('express');
const mongoose = require("mongoose");
const user = require('./src/routes/user/user')
const worker = require('./src/routes/worker/worker')
const processor = require('./src/routes/worker/process')
const cors = require("cors");
const logger = require('./src/utils/logger')

const app = express();
const port = process.env.port

let corsOptions = {
  origin: "*",
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose
  .connect(process.env.MONGO_URL, {
    dbName: process.env.DBNAME,
  })
  .then(() => {
    logger.info("Connected to the database")
  })
  .catch((error) => {
    logger.info(`Connected to the database ${error.message}`)
  });

app.use("/api", user);
app.use("/api", worker);
app.use("/api", processor);

app.listen(port, () => {
  logger.info(`Server listening at http://localhost:${port}`);
});