const Absen = require("../models/Absen");

exports.getStats = async (req, res, next) => {
  try {
    // Only guru and admin can access dashboard
    if (!["guru", "admin"].includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied. Only guru/admin can view dashboard.",
      });
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const currentDay = now.getDate();

    // Get all Absens
    // Populate manually if needed, but Absen now stores name/classId denormalized
    const allAbsens = await Absen.find().lean();

    // Total Absens
    const totalAbsen = allAbsens.length;

    // Absens this month
    const bulanIni = allAbsens.filter((absen) => {
      const date = new Date(absen.tanggalMulai);
      return (
        date.getMonth() === currentMonth && date.getFullYear() === currentYear
      );
    }).length;

    // Absens today
    const hariIni = allAbsens.filter((absen) => {
      const date = new Date(absen.tanggalMulai);
      return (
        date.getDate() === currentDay &&
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear
      );
    }).length;

    // Most common class (kelas terbanyak)
    const kelasCounts = {};
    let kelasTerbanyak = null;
    let maxCount = 0;

    allAbsens.forEach((absen) => {
      if (absen.classId) {
        kelasCounts[absen.classId] = (kelasCounts[absen.classId] || 0) + 1;
        if (kelasCounts[absen.classId] > maxCount) {
          maxCount = kelasCounts[absen.classId];
          kelasTerbanyak = absen.classId;
        }
      }
    });

    res.json({
      success: true,
      data: {
        totalAbsen,
        bulanIni,
        hariIni,
        kelasTerbanyak: kelasTerbanyak || "-",
      },
    });
  } catch (err) {
    console.error("[dashboard.getStats]", err);
    next(err);
  }
};
