const response_handler = require("../../helpers/responseHandler");
const Events = require("./events.model");
const validations = require("../../validations");
exports.get_events = async (req, res) => {
  try {
    const { page_no = 1, limit = 10 } = req.query;
    const skip_count = limit * (page_no - 1);
    const total_count = await Events.countDocuments();
    const data = await Events.find()
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip_count)
      .limit(limit)
      .lean();
    return response_handler(
      res,
      200,
      "Events fetched successfully",
      data,
      total_count
    );
  } catch (error) {
    return response_handler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.create_events = async (req, res) => {
  try {
    const create_events_validator = validations.create_events.validate(
      req.body,
      {
        abortEarly: true,
      }
    );
    if (create_events_validator.error) {
      return response_handler(
        res,
        400,
        `Invalid input: ${create_events_validator.error}`
      );
    }

    const existing_events = await Events.findOne({
      event_name: req.body.event_name,
    });
    if (existing_events) {
      return response_handler(res, 400, "Events already exists");
    }

    const new_events = await Events.create(req.body);
    //TODO: Send InApp Notification
    return response_handler(
      res,
      201,
      "Events created successfully",
      new_events
    );
  } catch (error) {
    return response_handler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.get_registered_events = async (req, res) => {
  try {
    const { page_no = 1, limit = 10 } = req.query;
    const skip_count = limit * (page_no - 1);
    const filter = { rsvp: { $elemMatch: { $eq: req.user_id } } };
    const total_count = await Events.countDocuments(filter);
    const data = await Events.find(filter)
      .skip(skip_count)
      .limit(limit)
      .sort({ createdAt: -1, _id: -1 });
    return response_handler(
      res,
      200,
      "Events fetched successfully",
      data,
      total_count
    );
  } catch (error) {
    return response_handler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.mark_attendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    if (!id) {
      return response_handler(res, 400, "Event ID is required");
    }

    if (!user_id) {
      return response_handler(res, 400, "User ID is required");
    }

    const event = await Events.findById(id);

    if (!event) {
      return response_handler(res, 400, "Event not found");
    }

    if (event.attendence.includes(user_id)) {
      return response_handler(res, 400, "User has already marked attendance");
    }

    event.attendence.push(user_id);
    await event.save();
    //TODO: Send User data as response (name, email, image)
    return response_handler(res, 200, "Attendance marked successfully");
  } catch (error) {
    return response_handler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.get_attendees = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return response_handler(res, 400, "Event ID is required");
    }
    const event = await Events.findById(id)
      .populate("rsvp", "name email image")
      .populate("attendence", "name email image");

    if (!event) {
      return response_handler(res, 400, "Event not found");
    }

    const rsvp_user_ids = new Set(
      event.rsvp.map((user) => user._id.toString())
    );

    const newly_registered = event.attendence.filter(
      (user) => !rsvp_user_ids.has(user._id.toString())
    );

    const unique_users_count = newly_registered.length;

    return response_handler(res, 200, "Attendees fetched successfully", {
      registered_users: event.rsvp,
      attendees: event.attendence,
      unique_users_count,
    });
  } catch (error) {
    return response_handler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.get_events_by_id = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return response_handler(res, 400, "Event ID is required");
    }
    const event = await Events.findById(id)
      .populate("rsvp", "name image")
      .populate("attendence", "name image")
      .populate("coordinators", "name image");

    if (!event) {
      return response_handler(res, 400, "Event not found");
    }

    const mapped_data = {
      ...event._doc,
      rsvp_count: event.rsvp.length,
      rsvp: event.rsvp.map((user) => {
        return {
          name: user.name,
          image: user.image,
        };
      }),
      attendence_count: event.attendence.length,
      attendence: event.attendence.map((user) => {
        return {
          name: user.name,
          image: user.image,
        };
      }),
    };

    return response_handler(
      res,
      200,
      "Event fetched successfully",
      mapped_data
    );
  } catch (error) {
    return response_handler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.update_events = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return response_handler(res, 400, "Event ID is required");
    }
    const update_events_validator = validations.update_events.validate(
      req.body,
      {
        abortEarly: true,
      }
    );
    if (update_events_validator.error) {
      return response_handler(
        res,
        400,
        `Invalid input: ${update_events_validator.error}`
      );
    }

    const event = await Events.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!event) {
      return response_handler(res, 400, "Event not found");
    }
    return response_handler(res, 200, "Event updated successfully", event);
  } catch (error) {
    return response_handler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.delete_events = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return response_handler(res, 400, "Event ID is required");
    }
    const event = await Events.findByIdAndDelete(id);
    if (!event) {
      return response_handler(res, 400, "Event not found");
    }
    return response_handler(res, 200, "Event deleted successfully", event);
  } catch (error) {
    return response_handler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.add_rsvp = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return response_handler(res, 400, "Event ID is required");
    }
    const event = await Events.findById(id);
    if (!event) {
      return response_handler(res, 400, "Event not found");
    }
    if (event.rsvp.includes(req.user_id)) {
      return response_handler(
        res,
        400,
        "You have already RSVP'd for this event"
      );
    }
    if (event.rsvp.length >= event.limit) {
      return response_handler(res, 400, "Event registration reached limit");
    }
    event.rsvp.push(req.user_id);
    await event.save();
    //TODO: Subscribe firebase topic to send notification
    return response_handler(res, 200, "RSVP added successfully");
  } catch (error) {
    return response_handler(res, 500, `Internal Server Error ${error.message}`);
  }
};
