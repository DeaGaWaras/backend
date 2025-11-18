// src/config/jwt.js
require('dotenv').config();

module.exports = {
  secret: process.env.JWT_SECRET || 'mochi',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d'
};
