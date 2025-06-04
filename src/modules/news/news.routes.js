const express = require("express");
const news_controller = require("./news.controller");
const check_access = require("../../middlewares/check_access");
const router = express.Router();

router
  .route("/")
  .get(check_access("news_management_view"), news_controller.get_news)
  .post(check_access("news_management_modify"), news_controller.create_news);

router.get("/user", news_controller.get_news_for_user);

router
  .route("/:id")
  .get(check_access("news_management_view"), news_controller.get_news_by_id)
  .put(check_access("news_management_modify"), news_controller.update_news)
  .delete(check_access("news_management_modify"), news_controller.delete_news);

module.exports = router;
