const express = require("express");
const promotions_controller = require("./promotions.controller");
const router = express.Router();

router
  .route("/")
  .get(promotions_controller.get_promotions)
  .post(promotions_controller.create_promotions);

router.get("/user", promotions_controller.get_promotions_for_user);

router
  .route("/:id")
  .get(promotions_controller.get_promotions_by_id)
  .put(promotions_controller.update_promotions)
  .delete(promotions_controller.delete_promotions);

module.exports = router;
