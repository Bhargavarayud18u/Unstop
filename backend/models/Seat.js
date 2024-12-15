const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  status: { type: String, enum: ['available', 'booked'], default: 'available' },
  user_name: { type: String, default: null },
});

const Seat = mongoose.model('Seat', seatSchema);

module.exports = Seat;
