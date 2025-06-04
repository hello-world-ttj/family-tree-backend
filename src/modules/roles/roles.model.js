const mongoose = require("mongoose");

const roles_schema = mongoose.Schema(
  {
    role_name: { type: String },
    description: { type: String },
    permissions: [{ type: String }],
    status: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Roles = mongoose.model("Roles", roles_schema);

module.exports = Roles;
