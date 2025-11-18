// src/models/Absen.js
const mongoose = require("mongoose");

const AbsenSchema = new mongoose.Schema({
  studentId: {
    type: Number,
    ref: "User",
    required: true,
  },
  name: { type: String }, // denormalized untuk performa
  classId: { type: String }, // kelas siswi
  date: { type: Date, required: true }, // tanggal absensi
  reason: {
    type: String,
    enum: ["haid", "sakit", "ijin", null],
    default: null,
  }, // alasan absen
  alasan: { type: String }, // backward compatibility
  tanggalMulai: { type: Date }, // backward compatibility
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "approved",
  },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

AbsenSchema.methods.remove = function () {
  return this.deleteOne();
};

module.exports = mongoose.model("Absen", AbsenSchema);
