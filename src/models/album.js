const mongoose = require("mongoose");

const albumSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    artist: { type: String, required: true, trim: true },
    genre: { type: String, required: true, trim: true },
    year: { type: Number, required: true, min: 1900 },
    songs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

albumSchema.index({ title: 1, artist: 1, year: 1 }, { unique: true });
albumSchema.index({ genre: 1 });
albumSchema.index({ artist: 1 });
albumSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Album", albumSchema);
