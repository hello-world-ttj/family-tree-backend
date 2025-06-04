const express = require("express");
const router = express.Router();
const news_route = require("../modules/news/news.routes");
const promotions_route = require("../modules/promotions/promotions.routes");
const events_route = require("../modules/events/events.routes");
const notifications_route = require("../modules/notifications/notifications.routes");

router.use("/news", news_route);
router.use("/promotions", promotions_route);
router.use("/events", events_route);
router.use("/notifications", notifications_route);

module.exports = router;
