const mongoose = require("mongoose");

const file_schema = mongoose.Schema({
  type: { type: String, enum: ["image", "video"] },
  url: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const folder_schema = mongoose.Schema(
  {
    name: { type: String, required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Events" },
    files: [file_schema],
  },
  { timestamps: true }
);

const Folder = mongoose.model("Folder", folder_schema);

module.exports = Folder;
