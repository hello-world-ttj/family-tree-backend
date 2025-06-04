const response_handler = require("../../helpers/responseHandler");
const validations = require("../../validations");
const News = require("./news.model");
exports.create_news = async (req, res) => {
  try {
    const create_news_validator = validations.create_news.validate(req.body, {
      abortEarly: true,
    });
    if (create_news_validator.error) {
      return response_handler(
        res,
        400,
        `Invalid input: ${create_news_validator.error}`
      );
    }
    const new_news = await News.create(req.body);
    //TODO: Send InApp Notification
    return response_handler(res, 201, "News created successfully", new_news);
  } catch (error) {
    return response_handler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.get_news_by_id = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return response_handler(res, 400, "News id is required");
    }
    const news = await News.findById(id);
    return response_handler(res, 200, "News fetched successfully", news);
  } catch (error) {
    return response_handler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.update_news = async (req, res) => {
  try {
    const update_news_validator = validations.update_news.validate(req.body, {
      abortEarly: true,
    });
    if (update_news_validator.error) {
      return response_handler(
        res,
        400,
        `Invalid input: ${update_news_validator.error}`
      );
    }
    const { id } = req.params;
    if (!id) {
      return response_handler(res, 400, "News id is required");
    }
    const news = await News.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    return response_handler(res, 200, "News updated successfully", news);
  } catch (error) {
    return response_handler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.delete_news = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return response_handler(res, 400, "News id is required");
    }
    const news = await News.findByIdAndDelete(id);
    return response_handler(res, 200, "News deleted successfully", news);
  } catch (error) {
    return response_handler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.get_news = async (req, res) => {
  try {
    const { page_no = 1, status, limit = 10, search, category } = req.query;
    const skip_count = 10 * (page_no - 1);
    const filter = {};
    if (search) {
      filter.$or = [
        { category: { $regex: search, $options: "i" } },
        { title: { $regex: search, $options: "i" } },
      ];
    }

    if (category !== "all") {
      filter.category = category;
    }
    if (status) {
      filter.status = status;
    }

    const total_count = await News.countDocuments(filter);
    const data = await News.find(filter)
      .skip(skip_count)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    return response_handler(
      res,
      200,
      "News fetched successfully",
      data,
      total_count
    );
  } catch (error) {
    return response_handler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.get_news_for_user = async (req, res) => {
  try {
    const filter = { status: "published" };
    const data = await News.find(filter).sort({ createdAt: -1 }).lean();
    return response_handler(res, 200, "News fetched successfully", data);
  } catch (error) {
    return response_handler(res, 500, `Internal Server Error ${error.message}`);
  }
};
