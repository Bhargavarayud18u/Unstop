const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const Seat = require('./models/Seat'); // Import seat model

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('Database connection error:', err));

// Initialize seats in the database (80 seats, 7 in each row, last row with 3 seats)
app.get('/initialize', async (req, res) => {
  const seats = [];
  for (let i = 1; i <= 80; i++) {
    seats.push({
      id: i,
      status: 'available',
      user_name: null,
    });
  }

  try {
    await Seat.deleteMany();
    await Seat.insertMany(seats);
    res.send('Seats initialized.');
  } catch (error) {
    res.status(500).send('Error initializing seats.');
  }
});

// Fetch all seats
app.get('/seats', async (req, res) => {
  try {
    const seats = await Seat.find();
    res.json(seats);
  } catch (error) {
    res.status(500).send('Error fetching seats.');
  }
});

// Book seats
// Book seats endpoint
app.post('/book', async (req, res) => {
  const { numSeats } = req.body;

  if (numSeats < 1 || numSeats > 7) {
    return res.status(400).send('Invalid number of seats. You can only book between 1 and 7 seats.');
  }

  try {
    const availableSeats = await Seat.find({ status: 'available' }).sort({ id: 1 });

    if (availableSeats.length < numSeats) {
      return res.status(400).send('Not enough seats available.');
    }

    let bookedSeats = [];

    // Step 1: Try to book seats in a single row
    for (let i = 0; i < availableSeats.length; i++) {
      const rowSeats = availableSeats.slice(i, i + 7); // Check each row (7 seats max per row)

      // Check if we can fit the required number of seats in this row
      if (rowSeats.filter(seat => seat.status === 'available').length >= numSeats) {
        // Find the first set of consecutive available seats
        let count = 0;
        let rowBookedSeats = [];
        for (let j = 0; j < rowSeats.length; j++) {
          if (rowSeats[j].status === 'available') {
            count++;
            rowBookedSeats.push(rowSeats[j]);
            if (count === numSeats) {
              bookedSeats = rowBookedSeats;
              break;
            }
          }
        }
        if (bookedSeats.length > 0) break; // Found seats in this row
      }
    }

    // Step 2: If not enough seats in a row, book nearby seats across rows
    if (bookedSeats.length === 0) {
      let remainingSeats = numSeats;
      bookedSeats = [];
      for (let i = 0; i < availableSeats.length && remainingSeats > 0; i++) {
        if (availableSeats[i].status === 'available') {
          bookedSeats.push(availableSeats[i]);
          remainingSeats--;
        }
      }
    }

    // Update the status of booked seats to 'booked'
    await Promise.all(
      bookedSeats.map((seat) => Seat.findByIdAndUpdate(seat._id, { status: 'booked' }))
    );

    res.json(bookedSeats);
  } catch (error) {
    res.status(500).send('Error booking seats.');
  }
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
