const cron = require("node-cron");
const User = require("../models/User");
const { sendBulkEmail } = require("./email.service");
const { generateReportExcel, generateReportPDF } = require("./report.service");

/**
 * Initialize scheduled daily report
 * Runs at 12:30 PM (noon 30 minutes)
 */
exports.initReportScheduler = () => {
  // Cron pattern: minute hour day-of-month month day-of-week
  // 30 12 * * * = At 12:30 every day
  const job = cron.schedule("30 12 * * *", async () => {
    console.log("📧 Starting automatic report generation and email...");
    try {
      await sendDailyReportToAllGurus();
    } catch (err) {
      console.error("❌ Report scheduler error:", err);
    }
  });

  console.log("✅ Report scheduler initialized - will run at 12:30 PM daily");
  return job;
};

/**
 * Send daily report to all gurus
 */
async function sendDailyReportToAllGurus() {
  try {
    // Get all guru emails
    const gurus = await User.find({ role: "guru" }).select("email name");
    if (!gurus.length) {
      console.log("⚠️  No gurus found to send reports");
      return;
    }

    const guruEmails = gurus.map((g) => g.email);
    console.log(`📋 Found ${gurus.length} gurus to send reports`);

    // Generate reports
    console.log("📄 Generating Excel report...");
    const excelBuffer = await generateReportExcel();

    console.log("📄 Generating PDF report...");
    const pdfBuffer = await generateReportPDF();

    // Prepare email
    const today = new Date().toLocaleDateString("id-ID");
    const emailSubject = `Laporan Absen Siswi - ${today}`;
    const emailHTML = `
      <h2>Laporan Absen Siswi SMAN 1 KEBULU</h2>
      <p>Tanggal: <strong>${today}</strong></p>
      <p>Laporan otomatis harian berisi:</p>
      <ul>
        <li>Laporan Harian - Jumlah absen hari ini</li>
        <li>Laporan Mingguan - Data 7 hari terakhir</li>
        <li>Laporan Per-Kelas - Breakdown per kelas</li>
      </ul>
      <p>File laporan tersedia dalam format Excel dan PDF di attachment.</p>
      <hr>
      <p><small>Laporan ini dikirim otomatis setiap hari pukul 12:30 siang.</small></p>
      <p><small>Sistem Absen Digital SMAN 1 KEBULU</small></p>
    `;

    const attachments = [
      {
        filename: `Laporan-Absen-${today}.xlsx`,
        content: excelBuffer,
        contentType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
      {
        filename: `Laporan-Absen-${today}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ];

    // Send bulk email
    console.log(`✉️  Sending reports to ${guruEmails.length} gurus...`);
    const results = await sendBulkEmail(
      guruEmails,
      emailSubject,
      emailHTML,
      attachments
    );

    // Log results
    const successful = results.filter((r) => r.success).length;
    console.log(
      `✅ Report sent successfully to ${successful}/${results.length} gurus`
    );
    results.forEach((r) => {
      if (r.success) {
        console.log(`   ✓ ${r.email}`);
      } else {
        console.log(`   ✗ ${r.email} - ${r.error}`);
      }
    });
  } catch (err) {
    console.error("❌ Error sending reports:", err.message);
  }
}

/**
 * Export function to manually trigger report (for testing)
 */
exports.triggerReportNow = async () => {
  console.log("🚀 Manual trigger: Sending report now...");
  await sendDailyReportToAllGurus();
};
