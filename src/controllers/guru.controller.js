const User = require('../models/User');

exports.listGurus = async (req, res, next) => {
  try {
    const gurus = await User.find({ role: 'guru' }).select('-password');
    res.json({ success: true, data: gurus });
  } catch (err) {
    console.error('[guru.listGurus]', err);
    next(err);
  }
};