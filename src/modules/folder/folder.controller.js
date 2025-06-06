const mongoose = require("mongoose");
const response_handler = require("../../helpers/responseHandler");
const validations = require("../../validations");
const Folder = require("./folder.model");
const Events = require("../events/events.model");

exports.create_folder = async (req, res) => {
  try {
    const create_folder_validator = validations.create_folder.validate(
      req.body,
      {
        abortEarly: true,
      }
    );
    if (create_folder_validator.error) {
      return response_handler(
        res,
        400,
        `Invalid input: ${create_media_validator.error}`
      );
    }

    const existing_folder = await Folder.findOne({
      name: req.body.name,
    });
    if (existing_folder) {
      return response_handler(res, 400, "Folder name already exists");
    }

    const folder = await Folder.create(req.body);
    return response_handler(res, 200, "Folder created successfully", folder);
  } catch (error) {
    return response_handler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.get_folder_by_id = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.query;

    if (!id) {
      return response_handler(res, 400, "Folder ID is required");
    }

    const pipeline = [
      {
        $match: { _id: new mongoose.Types.ObjectId(id) },
      },
    ];

    if (type) {
      pipeline.push({
        $addFields: {
          files: {
            $filter: {
              input: "$files",
              as: "file",
              cond: { $eq: ["$$file.type", type] },
            },
          },
        },
      });
    }

    const folder = await Folder.aggregate(pipeline);

    if (!folder) {
      return response_handler(res, 400, "Folder not found");
    }
    return response_handler(res, 200, "Folder found successfully", folder);
  } catch (error) {
    return response_handler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.update_folder = async (req, res) => {
  try {
    const update_folder_validator = validations.update_folder.validate(
      req.body,
      {
        abortEarly: true,
      }
    );
    if (update_folder_validator.error) {
      return response_handler(
        res,
        400,
        `Invalid input: ${update_media_validator.error}`
      );
    }
    const { id } = req.params;
    if (!id) {
      return response_handler(res, 400, "Folder id is required");
    }
    const folder = await Folder.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    return response_handler(res, 200, "Folder updated successfully", folder);
  } catch (error) {
    return response_handler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.delete_folder = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return response_handler(res, 400, "Folder id is required");
    }
    const folder = await Folder.findByIdAndDelete(id);
    return response_handler(res, 200, "Folder deleted successfully", folder);
  } catch (error) {
    return response_handler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.get_folder_by_event_id = async (req, res) => {
  try {
    const { page_no = 1, limit = 10, search } = req.query;
    const skip_count = limit * (page_no - 1);
    const { id } = req.params;
    if (!id) {
      return response_handler(res, 400, "Event ID is required");
    }
    const filter = {
      event: id,
    };

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    const total_count = await Folder.countDocuments(filter);

    const folder = await Folder.find(filter)
      .skip(skip_count)
      .limit(limit)
      .sort({ createdAt: -1 });

    const mapped_data = folder.map((folder) => {
      const image_count = folder.files.filter(
        (file) => file.type === "image"
      ).length;
      const video_count = folder.files.filter(
        (file) => file.type === "video"
      ).length;
      return {
        ...folder._doc,
        image_count,
        video_count,
      };
    });

    return response_handler(
      res,
      200,
      "Folder found successfully",
      mapped_data,
      total_count
    );
  } catch (error) {
    return response_handler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.add_files_to_folder = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return response_handler(res, 400, "Folder id is required");
    }

    if (!req.body.files) {
      return response_handler(res, 400, "Files are required");
    }

    if (!req.body.files.type || !req.body.files.url) {
      return response_handler(res, 400, "File type and url are required");
    }

    const upload_files = req.body.files.map((file) => ({
      ...file,
      user: req.user._id,
    }));

    const folder = await Folder.findByIdAndUpdate(
      id,
      { $push: { files: upload_files } },
      { new: true }
    );

    return response_handler(res, 200, "File added successfully", folder);
  } catch (error) {
    return response_handler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.remove_files_from_folder = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return response_handler(res, 400, "Folder id is required");
    }

    const { file_ids } = req.body;
    if (!file_ids || file_ids.length === 0) {
      return response_handler(res, 400, "File ids are required");
    }

    const folder = await Folder.findByIdAndUpdate(
      id,
      { $pull: { files: { _id: { $in: file_ids } } } },
      { new: true }
    );

    if (!folder) {
      return response_handler(res, 400, "Folder not found");
    }

    return response_handler(res, 200, "File removed successfully", folder);
  } catch (error) {
    return response_handler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.add_to_public_folder = async (req, res) => {
  try {
    const { files, event_id } = req.body;

    if (!files || files.length === 0) {
      return response_handler(res, 400, "Files are required");
    }

    if (!event_id) {
      return response_handler(res, 400, "Event ID is required");
    }
    const event = await Events.findById(event_id);
    if (!event) {
      return response_handler(res, 400, "Event not found");
    }

    let folder = await Folder.findOne({ name: "public", event: event_id });

    if (!folder) {
      folder = await Folder.create({
        name: "public",
        event: event_id,
        files: [],
      });
      await folder.save();
    }

    const upload_files = files.map((file) => ({
      ...file,
      user: req.user._id,
    }));

    const updated_folder = await Folder.findByIdAndUpdate(
      folder._id,
      { $push: { files: upload_files } },
      { new: true }
    );

    return response_handler(
      res,
      200,
      "Files added to public folder successfully",
      updated_folder
    );
  } catch (error) {
    return response_handler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.remove_from_public_folder = async (req, res) => {
  try {
    const { file_ids, event_id } = req.body;

    if (!file_ids || file_ids.length === 0) {
      return response_handler(res, 400, "File ids are required");
    }

    if (!event_id) {
      return response_handler(res, 400, "Event ID is required");
    }
    const event = await Events.findById(event_id);
    if (!event) {
      return response_handler(res, 400, "Event not found");
    }

    const folder = await Folder.findOne({ name: "public", event: event_id });

    if (!folder) {
      return response_handler(res, 400, "Public folder not found");
    }

    const updated_folder = await Folder.findByIdAndUpdate(
      folder._id,
      { $pull: { files: { _id: { $in: file_ids } } } },
      { new: true }
    );

    return response_handler(
      res,
      200,
      "Files removed from public folder successfully",
      updated_folder
    );
  } catch (error) {
    return response_handler(res, 500, `Internal Server Error ${error.message}`);
  }
};
