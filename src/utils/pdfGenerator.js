// src/utils/pdfGenerator.js
const PDFDocument = require("pdfkit");

module.exports = (absen) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const buffers = [];
      doc.on("data", (data) => buffers.push(data));
      doc.on("end", () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // header
      doc.fontSize(18).text("Surat Absen", { align: "center" });
      doc.moveDown();

      // meta
      doc.fontSize(12).text(`No: ${absen._id}`, { align: "right" });
      doc.moveDown();

      // body
      doc.text(`Nama siswi: ${absen.siswi.name}`);
      if (absen.siswi.kelas) doc.text(`Kelas: ${absen.siswi.kelas}`);
      doc.text(`Email: ${absen.siswi.email}`);
      doc.moveDown();

      doc.text(`Alasan:`);
      doc.text(absen.alasan, { indent: 20 });
      doc.moveDown();

      doc.text(
        `Tanggal Mulai: ${new Date(absen.tanggalMulai).toLocaleDateString()}`
      );
      doc.text(
        `Tanggal Selesai: ${new Date(
          absen.tanggalSelesai
        ).toLocaleDateString()}`
      );
      doc.moveDown();

      doc.text(`Status: ${absen.status}`);
      if (absen.notes) {
        doc.moveDown();
        doc.text(`Catatan:`);
        doc.text(absen.notes, { indent: 20 });
      }

      doc.moveDown(2);
      doc.text("Hormat kami,", { align: "right" });
      doc.moveDown(4);
      doc.text(
        absen.guruPembimbing
          ? absen.guruPembimbing.name
          : "................................",
        { align: "right" }
      );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
