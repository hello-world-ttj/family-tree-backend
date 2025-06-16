const mongoose = require("mongoose");

const authSchema = mongoose.Schema({
    personId: { type: mongoose.Schema.Types.ObjectId, ref: 'Person' },
    roleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Roles' },
    isAdmin: { type: Boolean, default: false },
    otp: { type: String },
    firebaseToken: { type: String },
    password: { type: String },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const Auth = mongoose.model("Auth", authSchema);

module.exports = Auth;