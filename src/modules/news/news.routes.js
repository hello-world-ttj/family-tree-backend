const express = require("express");
const news_controller = require("./news.controller");
const router = express.Router();

router
  .route("/")
  .get(news_controller.get_news)
  .post(news_controller.create_news);

router.get("/user", news_controller.get_news_for_user);

router
  .route("/:id")
  .get(news_controller.get_news_by_id)
  .put(news_controller.update_news)
  .delete(news_controller.delete_news);

module.exports = router;
