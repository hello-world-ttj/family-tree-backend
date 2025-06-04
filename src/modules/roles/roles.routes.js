const express = require("express");
const roles_controller = require("./roles.controller");
const check_access = require("../../middlewares/check_access");
const router = express.Router();

router
  .route("/")
  .get(check_access("roles_management_view"), roles_controller.get_roles)
  .post(check_access("roles_management_modify"), roles_controller.create_role);

router
  .route("/:id")
  .get(check_access("roles_management_view"), roles_controller.get_role_by_id)
  .put(check_access("roles_management_modify"), roles_controller.update_role)
  .delete(
    check_access("roles_management_modify"),
    roles_controller.delete_role
  );

module.exports = router;
