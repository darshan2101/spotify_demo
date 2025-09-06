const mongoose = require("mongoose");

const followSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    album: { type: mongoose.Schema.Types.ObjectId, ref: "Album", required: true },
  },
  { timestamps: true }
);

followSchema.index({ user: 1, album: 1 }, { unique: true });
followSchema.index({ album: 1 });
followSchema.index({ user: 1 });

module.exports = mongoose.model("Follow", followSchema);
