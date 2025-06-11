const response_handler = require("../helpers/responseHandler");
const Roles = require("../modules/roles/roles.model");

const check_access = (required_permission) => {
  return async (req, res, next) => {
    try {
      const user = req.user;

      const role_id = user.role_id;

      const role = await Roles.findById(role_id);

      if (!role) {
        return response_handler(res, 403, "Role not found");
      }

      const permissions = role.permissions || [];

      if (!permissions.includes(required_permission)) {
        return response_handler(
          res,
          403,
          "You don't have permission to perform this action"
        );
      }

      next();
    } catch (error) {
      return response_handler(
        res,
        500,
        `Check access middleware error ${error.message}`
      );
    }
  };
};

module.exports = check_access;
