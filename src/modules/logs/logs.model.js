const mongoose = require("mongoose");

const logs_schema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    method: { type: String },
    route: { type: String },
    status_code: { type: Number },
    ip: { type: String },
    user_agent: { type: String },
    request_body: { type: Object },
    action: { type: String },
  },
  { timestamps: true }
);

const Logs = mongoose.model("Logs", logs_schema);

module.exports = Logs;
