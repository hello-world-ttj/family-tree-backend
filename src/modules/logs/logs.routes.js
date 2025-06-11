const express = require("express");
const logs_controller = require("./logs.controller");
const router = express.Router();

router.get("/", logs_controller.get_logs);

module.exports = router;
