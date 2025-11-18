// src/app.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");

const connectDB = require("./config/db");
const { initReportScheduler } = require("./services/scheduler.service");

const authRoutes = require("./routes/auth.routes");
const AbsenRoutes = require("./routes/absen.routes");
const guruRoutes = require("./routes/guru.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const reportRoutes = require("./routes/report.routes");

// ⚠️ Opsional — hanya dipasang jika file ada
let usersRoutes = null;
try {
  usersRoutes = require("./routes/users.routes");
} catch (err) {
  console.warn("[INFO] users.routes.js tidak ditemukan, skip.");
}

const app = express();

// ===============
// ENV VARIABLES
// ===============
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// ===============
// CONNECT DATABASE
// ===============
if (!MONGO_URI) {
  console.error("❌ MONGO_URI tidak ditemukan di file .env!");
  process.exit(1);
}
connectDB(MONGO_URI);

// ===============
// MIDDLEWARES
// ===============
app.use(
  cors({
    origin: "*", // jika butuh restrict → ganti dengan URL frontend
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(helmet());

// ===============
// ROUTES
// ===============
app.use("/api/auth", authRoutes);
app.use("/api/absensi", AbsenRoutes);
app.use("/api/guru", guruRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/report", reportRoutes);

// pasang jika ada
if (usersRoutes) {
  app.use("/api/users", usersRoutes);
}

// basic healthcheck
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Backend berjalan dengan baik" });
});

// ===============
// ERROR HANDLER
// ===============
app.use((err, req, res, next) => {
  console.error("❌ ERROR:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Server error",
  });
});

// ===============
// START SERVER & SCHEDULER
// ===============
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
  console.log(`🟢 MongoDB terhubung ke: ${MONGO_URI}`);

  // Initialize automatic report scheduler
  initReportScheduler();
});
