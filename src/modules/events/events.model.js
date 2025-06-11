const mongoose = require("mongoose");

const events_schema = mongoose.Schema(
  {
    event_name: { type: String },
    description: { type: String },
    type: {
      type: String,
      enum: ["Online", "Offline"],
    },
    image: { type: String },
    event_start_date: { type: Date },
    event_end_date: { type: Date },
    poster_visibility_start_date: { type: Date },
    poster_visibility_end_date: { type: Date },
    platform: { type: String },
    link: { type: String },
    venue: { type: String },
    organiser_name: { type: String },
    coordinators: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    limit: { type: Number },
    speakers: [
      {
        name: { type: String },
        designation: { type: String },
        role: { type: String },
        image: { type: String },
      },
    ],
    status: {
      type: String,
      enum: ["pending", "live", "completed", "cancelled"],
      default: "pending",
    },
    rsvp: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    attendence: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

const Events = mongoose.model("Events", events_schema);

module.exports = Events;
