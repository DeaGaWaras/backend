const Absen = require("../models/Absen");
const pdfGenerator = require("../utils/pdfGenerator");

exports.createAbsen = async (req, res, next) => {
  try {
    const { alasan, tanggalMulai, reason, date, classId } = req.body;
    if (!alasan || !tanggalMulai)
      return res.status(400).json({ message: "Missing fields" });

    // Get user data
    const User = require("../models/User");
    const user = await User.findById(req.user._id);

    const absen = new Absen({
      studentId: req.user._id,
      name: user?.name || "Unknown",
      classId: classId || user?.kelas,
      alasan,
      tanggalMulai: new Date(tanggalMulai),
      reason: reason || null,
      date: date ? new Date(date) : new Date(tanggalMulai),
    });

    await absen.save();
    res.status(201).json({ success: true, data: absen });
  } catch (err) {
    console.error("[absen.createAbsen]", err);
    next(err);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === "siswi") query.studentId = req.user._id;

    const Absens = await Absen.find(query);
    res.json({ success: true, data: Absens });
  } catch (err) {
    console.error("[absen.getAll]", err);
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const { id } = req.params;
    const absen = await Absen.findById(id);
    if (!absen) return res.status(404).json({ message: "Absen not found" });

    if (req.user.role === "siswi" && absen.studentId !== req.user._id) {
      return res.status(403).json({ message: "Forbidden" });
    }
    res.json({ success: true, data: absen });
  } catch (err) {
    console.error("[absen.getOne]", err);
    next(err);
  }
};

exports.deleteAbsen = async (req, res, next) => {
  try {
    const { id } = req.params;
    const absen = await Absen.findById(id);
    if (!absen) return res.status(404).json({ message: "Absen not found" });

    if (req.user.role === "siswi") {
      if (absen.studentId !== req.user._id)
        return res.status(403).json({ message: "Forbidden" });
      if (absen.status !== "pending")
        return res
          .status(400)
          .json({ message: "Cannot delete non-pending absen" });
    }

    await Absen.findByIdAndDelete(id);
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    console.error("[absen.deleteAbsen]", err);
    next(err);
  }
};

exports.generatePdf = async (req, res, next) => {
  try {
    const { id } = req.params;
    const absen = await Absen.findById(id);
    if (!absen) return res.status(404).json({ message: "Absen not found" });

    if (req.user.role === "siswi" && absen.studentId !== req.user._id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const pdfBuffer = await pdfGenerator(absen);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Absen_${absen._id}.pdf`
    );
    res.send(pdfBuffer);
  } catch (err) {
    console.error("[absen.generatePdf]", err);
    next(err);
  }
};

// Get aggregated haid/menstruasi data per-student
exports.getHaidAggregate = async (req, res, next) => {
  try {
    const { month, classId } = req.query;

    // Default to current month if not provided
    let targetMonth = month;
    if (!targetMonth) {
      const now = new Date();
      targetMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
    }

    const [year, mon] = targetMonth.split("-");
    if (!year || !mon) {
      return res
        .status(400)
        .json({ message: "Invalid month format. Use YYYY-MM" });
    }

    const startDate = new Date(`${year}-${mon}-01`);
    const endDate = new Date(year, mon, 0); // last day of month

    // Build match stage
    const matchStage = {
      date: {
        $gte: startDate,
        $lte: endDate,
      },
      $or: [
        { reason: { $exists: false } },
        { reason: null },
        { reason: /haid/i },
      ],
    };

    if (classId) {
      matchStage.classId = classId;
    }

    // Build pipeline that collects unique days per student and returns them
    // sorted. We avoid unsupported expressions inside $project by unwinding
    // the grouped days, sorting, then regrouping to preserve order.
    const pipeline = [
      { $match: matchStage },
      {
        $project: {
          studentId: 1,
          name: 1,
          classId: 1,
          day: { $dayOfMonth: "$date" },
        },
      },
      {
        $group: {
          _id: "$studentId",
          name: { $first: "$name" },
          classId: { $first: "$classId" },
          days: { $addToSet: "$day" },
        },
      },
      // unwind the days array so we can sort the individual day values
      { $unwind: { path: "$days" } },
      // sort by student name (or id) and day value
      { $sort: { name: 1, days: 1 } },
      // regroup to reassemble sorted days arrays per student
      {
        $group: {
          _id: "$_id",
          name: { $first: "$name" },
          classId: { $first: "$classId" },
          days: { $push: "$days" },
        },
      },
      // final projection
      {
        $project: {
          studentId: "$_id",
          name: 1,
          classId: 1,
          days: 1,
          _id: 0,
        },
      },
      { $sort: { name: 1 } },
    ];

    const result = await Absen.aggregate(pipeline);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error("[absen.getHaidAggregate]", err);
    next(err);
  }
};
