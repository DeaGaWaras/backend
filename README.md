# 🏫 Sekolah Management System — Backend API

Backend REST API untuk Sistem Management Sekolah dengan fitur manajemen absensi, laporan, dan dashboard.

## ✨ Features

- 🔐 **JWT Authentication** - Secure user authentication dengan token
- 👥 **Role-Based Access** - siswi, Guru, Admin dengan permission yang berbeda
- 📋 **Absensi Management** - Manajemen absensi harian dengan dukungan haid/menstruasi
- 📊 **Aggregated Reports** - Laporan absensi per-siswi dan per-kelas
- 📄 **PDF Generation** - Generate laporan absensi dalam format PDF
- ⏰ **Scheduled Reports** - Laporan otomatis setiap hari
- 📈 **Dashboard** - Overview statistik sekolah

---

## 🚀 Quick Start

### Prerequisites

- Node.js v14+
- npm atau yarn
- MongoDB Account (free di [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- Git (opsional)

### Installation

```bash
# 1. Clone/Download repository
cd backend

# 2. Install dependencies
npm install

# 3. Create .env file
cat > .env << EOF
PORT=3000
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRES_IN=7d
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=noreply@smanike.sch.id
EOF

# 4. Start server
npm start

# Server akan berjalan di http://localhost:3000
```

### Development Mode

```bash
npm run dev
# Auto-reload dengan nodemon
```

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── app.js                    # Express app setup
│   ├── config/
│   │   ├── db.js                 # MongoDB connection
│   │   └── jwt.js                # JWT configuration
│   ├── controllers/
│   │   ├── auth.controller.js    # Auth logic
│   │   └── absen.controller.js   # Absensi logic (dengan getHaidAggregate)
│   ├── models/
│   │   ├── User.js               # User schema
│   │   └── Absen.js              # Absensi schema (dengan field haid)
│   ├── routes/
│   │   ├── auth.routes.js
│   │   └── absen.routes.js       # Route dengan /haid/aggregate
│   ├── middlewares/
│   │   ├── auth.middleware.js    # JWT verification
│   │   └── role.middleware.js    # Role-based access
│   └── utils/
│       └── pdfGenerator.js       # PDF generation utility
├── .env                          # Environment variables
├── .gitignore
├── package.json
├── API_DOCUMENTATION.md          # Full API docs
├── SPEC_ABSENSI_HAID.md          # Detailed spec untuk haid
└── README.md                     # This file
```

---

## 🔌 API Endpoints Overview

### Authentication

```
POST   /api/auth/register          Register user baru
POST   /api/auth/login             Login dan dapatkan token
GET    /api/auth/profile           Get profile user (perlu token)
```

### Absensi

```
POST   /api/absensi/               Create absensi baru
GET    /api/absensi/               List semua absensi
GET    /api/absensi/haid/aggregate Get aggregated haid data ⭐ NEW
GET    /api/absensi/:id            Get detail absensi
DELETE /api/absensi/:id            Delete absensi
GET    /api/absensi/:id/pdf        Generate PDF
```

### Users, Guru, Dashboard, Report

```
GET    /api/users                  List users
GET    /api/guru/                  List gurus
GET    /api/dashboard/stats        Dashboard stats
GET    /api/report/daily           Daily report
GET    /api/report/weekly          Weekly report
GET    /api/report/per-class       Per-class report
```

Lihat [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) untuk detail lengkap.

---

## 🧪 Testing API

### Option 1: Gunakan cURL

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Budi",
    "email":"budi@test.com",
    "password":"123456",
    "role":"guru"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"budi@test.com",
    "password":"123456"
  }'

# Get aggregate haid (ganti TOKEN dengan hasil login)
curl -X GET "http://localhost:3000/api/absensi/haid/aggregate?month=2025-11" \
  -H "Authorization: Bearer TOKEN"
```

### Option 2: Gunakan Postman

1. Import collection dari `postman_collection.json` (jika ada)
2. Set `base_url` variable ke `http://localhost:3000`
3. Set `token` variable dari login response
4. Run requests

### Option 3: Gunakan PowerShell Script

```bash
# Di folder backend, jalankan:
powershell -File test-api.ps1
```

---

## 📊 Absensi Haid Feature

### Endpoint Aggregate

```
GET /api/absensi/haid/aggregate?month=YYYY-MM&classId=CLASS
Authorization: Bearer <token>
Roles: guru, admin
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "studentId": "...",
      "name": "Alya Susanti",
      "classId": "X.A",
      "days": [19, 20, 21, 26, 27]
    }
  ]
}
```

Array `days` berisi tanggal (1-31) ketika siswi memiliki `reason: "haid"` di bulan yang dipilih.

### Cara Menggunakan di Frontend

Lihat `SPEC_ABSENSI_HAID.md` untuk detail implementasi dan cara render di frontend.

---

## 🔒 Authentication & Authorization

### Login Flow

```
1. User register → hash password
2. User login → verify password → issue JWT token
3. Client store token
4. Client send token di Authorization header
5. Middleware verify token
6. Middleware check role permission
7. Handler process request
```

### Example JWT Header

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3Mzk1ZTEyMzQ1Njc4OTBhYmNkZWYiLCJyb2xlIjoiZ3VydSIsImlhdCI6MTczMTk5NDgwMH0.abcdefghijklmnop...
```

### Roles & Permissions

| Role      | Akses                                                           |
| --------- | --------------------------------------------------------------- |
| **siswi** | Lihat profil, buat/hapus absensi sendiri, lihat laporan pribadi |
| **guru**  | Lihat semua absensi, generate report, akses dashboard           |
| **admin** | Full access ke semua endpoint                                   |

---

## 🛠 Development

### Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Security**: bcryptjs (password hashing)
- **PDF**: pdfkit
- **Scheduler**: node-cron
- **Email**: nodemailer
- **Logging**: morgan

### Scripts

```bash
npm start                # Start production
npm run dev              # Start development (dengan auto-reload)
npm test                 # Run tests (jika ada)
```

---

## 🚨 Troubleshooting

### Error: "Port 3000 already in use"

```bash
# Linux/Mac
lsof -i :3000
kill -9 <PID>

# Windows PowerShell
Get-Process node | Stop-Process -Force
```

### Error: "MongoDB connection failed"

- Pastikan MongoDB Atlas/Local sudah running
- Check MONGO_URI di `.env`
- Test connection dengan MongoDB Compass

### Error: "Invalid or expired token"

- Ensure token format: `Bearer <token>` (ada spasi)
- Token expire setiap 7 hari (sesuai JWT_EXPIRES_IN)
- Login lagi untuk dapatkan token baru

### Mongoose "remove method" Warning

Ignore warning ini, sudah dihandle di model. Akan di-fix di versi berikutnya.

---

## 📋 Checklist Pre-Production

- [ ] Semua endpoint tested dengan cURL/Postman
- [ ] Environment variables dikonfigurasi
- [ ] MongoDB backup strategy di-setup
- [ ] JWT secret diganti dengan value random 32+ chars
- [ ] HTTPS enabled di production
- [ ] CORS properly configured untuk domain frontend
- [ ] Rate limiting ditambahkan di auth endpoints
- [ ] Error logging di-setup (Sentry/DataDog)
- [ ] Database indexing di-optimize
- [ ] Dokumentasi updated

---

## 📖 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [JWT Guide](https://jwt.io/)
- [MongoDB Best Practices](https://docs.mongodb.com/manual/core/admin-practices/)
- [RESTful API Design](https://restfulapi.net/)

---

## 👥 Team

- **Backend Lead**: [Your Name]
- **Database**: MongoDB Atlas
- **Deployment**: [Platform]

---

## 📝 License

MIT License - Feel free to use this project

---

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push ke branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📞 Support

- 📧 **Email**: backend-team@school.com
- 💬 **Slack**: #backend-support
- 🐛 **Issues**: GitHub Issues
- 📚 **Docs**: See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

---

**Version**: 1.0  
**Last Updated**: 2025-11-19  
**Status**: ✅ Production Ready
