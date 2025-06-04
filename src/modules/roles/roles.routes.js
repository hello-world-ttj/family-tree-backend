const express = require("express");
const roles_controller = require("./roles.controller");
const router = express.Router();

router
  .route("/")
  .get(roles_controller.get_roles)
  .post(roles_controller.create_role);

router
  .route("/:id")
  .get(roles_controller.get_role_by_id)
  .put(roles_controller.update_role)
  .delete(roles_controller.delete_role);

module.exports = router;
