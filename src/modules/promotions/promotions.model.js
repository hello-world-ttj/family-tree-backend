const mongoose = require("mongoose");

const promotions_schema = mongoose.Schema(
  {
    title: { type: String },
    description: { type: String },
    type: {
      type: String,
      enum: ["banner", "video", "poster", "notice"],
    },
    start_date: { type: Date },
    end_date: { type: Date },
    media: { type: String },
    link: { type: String },
    priority: { type: Number },
    status: {
      type: String,
      enum: ["active", "expired", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

const Promotions = mongoose.model("Promotions", promotions_schema);

module.exports = Promotions;
