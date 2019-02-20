const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const userSchema = new Schema({
  username: String,
  password: String,
  status: { type: String, enum: ['Pending Confirmation', 'Active'], default: 'Pending Confirmation' },
  email: { type: String, unique: true, required: true },
  confirmationCode: String
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);
module.exports = User;
