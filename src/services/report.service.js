const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");
const Absen = require("../models/Absen");
const User = require("../models/User");

/**
 * Generate Excel file with all reports
 */
exports.generateReportExcel = async () => {
  const workbook = new ExcelJS.Workbook();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  // ===== DAILY REPORT SHEET =====
  const dailySheet = workbook.addWorksheet("Laporan Harian");
  const dailyReport = await Absen.aggregate([
    { $match: { tanggalMulai: { $gte: today, $lt: tomorrow } } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const dailyData = { approved: 0, pending: 0, rejected: 0 };
  dailyReport.forEach((item) => {
    dailyData[item._id] = item.count;
  });

  dailySheet.columns = [
    { header: "Status", key: "status", width: 15 },
    { header: "Jumlah", key: "count", width: 10 },
  ];
  dailySheet.addRows([
    { status: "Disetujui", count: dailyData.approved },
    { status: "Tertunda", count: dailyData.pending },
    { status: "Ditolak", count: dailyData.rejected },
  ]);

  // Style header
  dailySheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF4472C4" },
  };
  dailySheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };

  // ===== WEEKLY REPORT SHEET =====
  const weeklySheet = workbook.addWorksheet("Laporan Mingguan");
  const weeklyReport = await Absen.aggregate([
    { $match: { tanggalMulai: { $gte: weekAgo, $lt: today } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$tanggalMulai" } },
        total: { $sum: 1 },
        approved: { $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] } },
        pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
        rejected: { $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] } },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  weeklySheet.columns = [
    { header: "Tanggal", key: "_id", width: 15 },
    { header: "Total", key: "total", width: 10 },
    { header: "Disetujui", key: "approved", width: 12 },
    { header: "Tertunda", key: "pending", width: 12 },
    { header: "Ditolak", key: "rejected", width: 12 },
  ];
  weeklySheet.addRows(weeklyReport);

  weeklySheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF70AD47" },
  };
  weeklySheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };

  // ===== PER-CLASS REPORT SHEET =====
  const classSheet = workbook.addWorksheet("Laporan Per-Kelas");
  const classReport = await Absen.aggregate([
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
        approved: { $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] } },
        pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
        rejected: { $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] } },
      },
    },
    { $sort: { total: -1 } },
  ]);

  classSheet.columns = [
    { header: "Kelas", key: "_id", width: 20 },
    { header: "Total", key: "total", width: 10 },
    { header: "Disetujui", key: "approved", width: 12 },
    { header: "Tertunda", key: "pending", width: 12 },
    { header: "Ditolak", key: "rejected", width: 12 },
  ];
  classSheet.addRows(classReport);

  classSheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFFC000" },
  };
  classSheet.getRow(1).font = { bold: true, color: { argb: "FF000000" } };

  return await workbook.xlsx.writeBuffer();
};

/**
 * Generate PDF report
 */
exports.generateReportPDF = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const chunks = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));

      const today = new Date();
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);

      // Title
      doc
        .fontSize(18)
        .font("Helvetica-Bold")
        .text("LAPORAN Absen SISWI", { align: "center" });
      doc.fontSize(12).text(`SMAN 1 KEBULU`, { align: "center" });
      doc.fontSize(10).text(`Tanggal: ${today.toLocaleDateString("id-ID")}`, {
        align: "center",
      });
      doc.moveDown();

      // Daily Report
      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .text("Laporan Harian", { underline: true });
      const dailyReport = await Absen.aggregate([
        {
          $match: {
            tanggalMulai: {
              $gte: new Date(today.setHours(0, 0, 0, 0)),
              $lt: new Date(today.setDate(today.getDate() + 1)),
            },
          },
        },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]);

      const dailyData = { approved: 0, pending: 0, rejected: 0 };
      dailyReport.forEach((item) => {
        dailyData[item._id] = item.count;
      });

      doc
        .fontSize(11)
        .text(
          `Total Absen: ${Object.values(dailyData).reduce((a, b) => a + b, 0)}`
        );
      doc.text(`Disetujui: ${dailyData.approved}`);
      doc.text(`Tertunda: ${dailyData.pending}`);
      doc.text(`Ditolak: ${dailyData.rejected}`);
      doc.moveDown();

      // Weekly Report
      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .text("Laporan Mingguan (7 Hari)", { underline: true });
      const weeklyReport = await Absen.aggregate([
        { $match: { tanggalMulai: { $gte: weekAgo } } },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$tanggalMulai" },
            },
            total: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      doc.fontSize(10);
      weeklyReport.forEach((item) => {
        doc.text(`${item._id}: ${item.total} absen`);
      });
      doc.moveDown();

      // Per-Class Summary
      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .text("Ringkasan Per-Kelas", { underline: true });
      const classReport = await Absen.aggregate([
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
          },
        },
        { $sort: { total: -1 } },
      ]);

      doc.fontSize(10);
      classReport.forEach((item) => {
        doc.text(`${item._id}: ${item.total} absen`);
      });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
