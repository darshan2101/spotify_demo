const mongoose = require("mongoose");

const songSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    duration: { type: Number, required: true, min: 1 },
    album: { type: mongoose.Schema.Types.ObjectId, ref: "Album", index: true },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

songSchema.index({ title: 1, album: 1 }, { unique: true });

module.exports = mongoose.model("Song", songSchema);
