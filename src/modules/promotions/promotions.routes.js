const express = require("express");
const promotions_controller = require("./promotions.controller");
const check_access = require("../../middlewares/check_access");
const router = express.Router();

router
  .route("/")
  .get(
    check_access("promotions_management_view"),
    promotions_controller.get_promotions
  )
  .post(
    check_access("promotions_management_modify"),
    promotions_controller.create_promotions
  );

router.get("/user", promotions_controller.get_promotions_for_user);

router
  .route("/:id")
  .get(
    check_access("promotions_management_view"),
    promotions_controller.get_promotions_by_id
  )
  .put(
    check_access("promotions_management_modify"),
    promotions_controller.update_promotions
  )
  .delete(
    check_access("promotions_management_modify"),
    promotions_controller.delete_promotions
  );

module.exports = router;
