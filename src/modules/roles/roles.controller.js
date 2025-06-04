const response_handler = require("../../helpers/responseHandler");
const Roles = require("./roles.model");
const validations = require("../../validations");
exports.get_roles = async (req, res) => {
  try {
    const { page_no = 1, limit = 10 } = req.query;
    const skip_count = limit * (page_no - 1);
    const total_count = await Roles.countDocuments();
    const data = await Roles.find().skip(skip_count).limit(limit);
    return response_handler(
      res,
      200,
      "Roles fetched successfully",
      data,
      total_count
    );
  } catch (error) {
    return response_handler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.create_role = async (req, res) => {
  try {
    const create_role_validator = validations.create_role.validate(req.body, {
      abortEarly: true,
    });
    if (create_role_validator.error) {
      return response_handler(
        res,
        400,
        `Invalid input: ${create_role_validator.error}`
      );
    }
    const role = await Roles.create(req.body);
    return response_handler(res, 200, "Role created successfully", role);
  } catch (error) {
    return response_handler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.get_role_by_id = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return response_handler(res, 400, "Role ID is required");
    }
    const role = await Roles.findById(id);
    if (!role) {
      return response_handler(res, 400, "Role not found");
    }
    return response_handler(res, 200, "Role fetched successfully", role);
  } catch (error) {
    return response_handler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.update_role = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return response_handler(res, 400, "Role ID is required");
    }
    const update_role_validator = validations.update_role.validate(req.body, {
      abortEarly: true,
    });
    if (update_role_validator.error) {
      return response_handler(
        res,
        400,
        `Invalid input: ${update_role_validator.error}`
      );
    }
    const role = await Roles.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!role) {
      return response_handler(res, 400, "Role not found");
    }
    return response_handler(res, 200, "Role updated successfully", role);
  } catch (error) {
    return response_handler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.delete_role = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return response_handler(res, 400, "Role ID is required");
    }
    const role = await Roles.findByIdAndDelete(id);
    if (!role) {
      return response_handler(res, 400, "Role not found");
    }
    return response_handler(res, 200, "Role deleted successfully", role);
  } catch (error) {
    return response_handler(res, 500, `Internal Server Error ${error.message}`);
  }
};
