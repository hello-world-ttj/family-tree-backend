const mongoose = require("mongoose");

const notifications_schema = mongoose.Schema(
  {
    category: {
      type: String,
      enum: ["marriage", "death", "house-warming", "custom"],
    },
    users: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        read: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

const Notifications = mongoose.model("Notifications", notifications_schema);

module.exports = Notifications;
