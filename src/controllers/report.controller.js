const Absen = require("../models/Absen");

// Daily Report
exports.getDailyReport = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const report = await Absen.aggregate([
      { $match: { tanggalMulai: { $gte: today, $lt: tomorrow } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const data = { approved: 0, pending: 0, rejected: 0 };
    report.forEach((item) => {
      data[item._id] = item.count;
    });

    res.json({ success: true, data, date: today.toISOString().split("T")[0] });
  } catch (err) {
    console.error("[getDailyReport]", err);
    next(err);
  }
};

// Weekly Report
exports.getWeeklyReport = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const report = await Absen.aggregate([
      { $match: { tanggalMulai: { $gte: weekAgo, $lt: today } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$tanggalMulai" } },
          total: { $sum: 1 },
          approved: {
            $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] },
          },
          pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
          rejected: {
            $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ success: true, data: report });
  } catch (err) {
    console.error("[getWeeklyReport]", err);
    next(err);
  }
};

// Per-Class Report
exports.getPerClassReport = async (req, res, next) => {
  try {
    const report = await Absen.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "siswi",
          foreignField: "_id",
          as: "siswiInfo",
        },
      },
      { $unwind: "$siswiInfo" },
      {
        $group: {
          _id: "$siswiInfo.kelas",
          total: { $sum: 1 },
          approved: {
            $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] },
          },
          pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
          rejected: {
            $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] },
          },
        },
      },
      { $sort: { total: -1 } },
    ]);

    res.json({ success: true, data: report });
  } catch (err) {
    console.error("[getPerClassReport]", err);
    next(err);
  }
};

// Daily Report
exports.getDailyReport = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const report = await Absen.aggregate([
      { $match: { tanggalMulai: { $gte: today, $lt: tomorrow } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const data = { approved: 0, pending: 0, rejected: 0 };
    report.forEach((item) => {
      data[item._id] = item.count;
    });

    res.json({ success: true, data, date: today.toISOString().split("T")[0] });
  } catch (err) {
    console.error("[getDailyReport]", err);
    next(err);
  }
};

// Weekly Report
exports.getWeeklyReport = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const report = await Absen.aggregate([
      { $match: { tanggalMulai: { $gte: weekAgo, $lt: today } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$tanggalMulai" } },
          total: { $sum: 1 },
          approved: {
            $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] },
          },
          pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
          rejected: {
            $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ success: true, data: report });
  } catch (err) {
    console.error("[getWeeklyReport]", err);
    next(err);
  }
};

// Per-Class Report
exports.getPerClassReport = async (req, res, next) => {
  try {
    const report = await Absen.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "siswi",
          foreignField: "_id",
          as: "siswiInfo",
        },
      },
      { $unwind: "$siswiInfo" },
      {
        $group: {
          _id: "$siswiInfo.kelas",
          total: { $sum: 1 },
          approved: {
            $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] },
          },
          pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
          rejected: {
            $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] },
          },
        },
      },
      { $sort: { total: -1 } },
    ]);

    res.json({ success: true, data: report });
  } catch (err) {
    console.error("[getPerClassReport]", err);
    next(err);
  }
};
