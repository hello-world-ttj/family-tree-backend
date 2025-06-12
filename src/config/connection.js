const mongoose = require("mongoose");
const clc = require("cli-color");
require('dotenv').config({ path: './.env' });

const { MONGO_URL } = process.env;

mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log(clc.blueBright("✓ Mongoose connection established..!"));
    //* Start the cron job
    // require("../jobs");
  })
  .catch((error) => {
    console.log(clc.bgCyanBright(error));
  });
