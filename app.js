require("dotenv").config();
const express = require("express");
const cors = require("cors");
const volleyball = require("volleyball");
const clc = require("cli-color");
const response_handler = require("./src/helpers/responseHandler");
const news_route = require("./src/modules/news/news.routes");
const promotions_route = require("./src/modules/promotions/promotions.routes");

//! Create an instance of the Express application
const app = express();
//* Define the PORT & API version based on environment variable
const { PORT, API_VERSION, NODE_ENV } = process.env;
//* Use volleyball for request logging
app.use(volleyball);
//* Enable Cross-Origin Resource Sharing (CORS) middleware
app.use(cors());
//* Parse JSON request bodies
app.use(express.json());
//* Set the base path for API routes
const BASE_PATH = `/api/${API_VERSION}`;
//* Import database connection module
require("./src/config/connection");

//? Define a route for the API root
app.get(BASE_PATH, (req, res) => {
  return response_handler(
    res,
    200,
    "🛡️ Welcome! All endpoints are fortified. Do you possess the master 🗝️?"
  );
});

//* Health Check Route
app.get("/health", (req, res) => {
  return response_handler(res, 200, "✅ Server is healthy", {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

//* Configure routes for user API
app.use(`${BASE_PATH}/news`, news_route);
app.use(`${BASE_PATH}/promotions`, promotions_route);

app.listen(PORT, () => {
  const port_message = clc.redBright(`✓ App is running on port: ${PORT}`);
  const env_message = clc.yellowBright(
    `✓ Environment: ${NODE_ENV || "development"}`
  );
  console.log(`${port_message}\n${env_message}`);
});
