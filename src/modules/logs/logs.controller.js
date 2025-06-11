const response_handler = require("../../helpers/responseHandler");
const Logs = require("./logs.model");

exports.get_logs = async (req, res) => {
  try {
    const { page_no = 1, limit = 10 } = req.query;
    const skip_count = limit * (page_no - 1);
    const total_count = await Logs.countDocuments();
    const data = await Logs.find()
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip_count)
      .limit(limit);
    return response_handler(
      res,
      200,
      "Logs fetched successfully",
      data,
      total_count
    );
  } catch (error) {
    return response_handler(res, 500, `Internal Server Error ${error.message}`);
  }
};
