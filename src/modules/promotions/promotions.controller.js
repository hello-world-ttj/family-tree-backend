const response_handler = require("../../helpers/responseHandler");
const validations = require("../../validations");
const Promotions = require("./promotions.model");
const moment = require("moment-timezone");
const { handle_priority_swap } = require("./promotions.service");

exports.get_promotions = async (req, res) => {
  try {
    const { page_no = 1, type, limit = 10 } = req.query;
    const skip_count = limit * (page_no - 1);
    const filter = {};
    if (type) {
      filter.type = type;
    }
    const total_count = await Promotions.countDocuments(filter);
    const data = await Promotions.find(filter)
      .skip(skip_count)
      .limit(limit)
      .sort({ priority: 1, createdAt: -1, _id: 1 })
      .lean();

    return response_handler(
      res,
      200,
      `Promotions found successfully..!`,
      data,
      total_count
    );
  } catch (error) {
    return response_handler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.get_promotions_by_id = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return response_handler(res, 400, "Promotions id is required");
    }
    const promotion = await Promotions.findById(id);
    return response_handler(
      res,
      200,
      "Promotions fetched successfully",
      promotion
    );
  } catch (error) {
    return response_handler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.create_promotions = async (req, res) => {
  try {
    const create_promotions_validator = validations.create_promotions.validate(
      req.body,
      {
        abortEarly: true,
      }
    );
    if (create_promotions_validator.error) {
      return response_handler(
        res,
        400,
        `Invalid input: ${create_promotions_validator.error}`
      );
    }
    if (req.body.type) {
      await handle_priority_swap(req.body.priority, req.body.type, null);
    }
    const new_promotions = await Promotions.create(req.body);
    return response_handler(
      res,
      201,
      "Promotions created successfully",
      new_promotions
    );
  } catch (error) {
    return response_handler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.update_promotions = async (req, res) => {
  try {
    const update_promotions_validator = validations.update_promotions.validate(
      req.body,
      {
        abortEarly: true,
      }
    );
    if (update_promotions_validator.error) {
      return response_handler(
        res,
        400,
        `Invalid input: ${update_promotions_validator.error}`
      );
    }
    const { id } = req.params;
    if (!id) {
      return response_handler(res, 400, "Promotions id is required");
    }
    const existing_promotion = await Promotions.findById(id);
    if (!existing_promotion) {
      return response_handler(res, 400, "Promotions not found");
    }
    const promotion_type = req.body.type || existing_promotion.type;
    if (req.body.priority) {
      await handle_priority_swap(req.body.priority, promotion_type, id);
      delete req.body.priority;
    }
    const promotions = await Promotions.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    return response_handler(
      res,
      200,
      "Promotions updated successfully",
      promotions
    );
  } catch (error) {
    return response_handler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.delete_promotions = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return response_handler(res, 400, "Promotions id is required");
    }
    const promotions = await Promotions.findByIdAndDelete(id);
    return response_handler(
      res,
      200,
      "Promotions deleted successfully",
      promotions
    );
  } catch (error) {
    return response_handler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.get_promotions_for_user = async (req, res) => {
  try {
    const filter = {
      status: "active",
    };
    const today = moment().toISOString();
    filter.end_date = {
      $gte: today,
    };
    filter.start_date = {
      $lte: today,
    };
    const data = await Promotions.find(filter)
      .sort({ priority: 1, createdAt: -1 })
      .lean();
    return response_handler(res, 200, "Promotions fetched successfully", data);
  } catch (error) {
    return response_handler(res, 500, `Internal Server Error ${error.message}`);
  }
};
