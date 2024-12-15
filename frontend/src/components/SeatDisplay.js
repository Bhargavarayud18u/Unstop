import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SeatBooking = () => {
  const [seats, setSeats] = useState([]);
  const [numSeats, setNumSeats] = useState(1);
  const [bookedSeats, setBookedSeats] = useState([]);

  useEffect(() => {
    // Fetch initial seats data when the component mounts
    fetchSeats();
  }, []);

  // Function to fetch seats data
  const fetchSeats = () => {
    axios
      .get('https://unstop-z41h.onrender.com/seats')
      .then((response) => setSeats(response.data))
      .catch((error) => console.error('Error fetching seats:', error));
  };

  // Function to handle seat booking
  const handleSeatBooking = () => {
    if (numSeats < 1 || numSeats > 7) {
      alert('You can only book between 1 and 7 seats at a time.');
      return;
    }

    axios
      .post('https://unstop-z41h.onrender.com/book', { numSeats })
      .then((response) => {
        const booked = response.data;
        setBookedSeats(booked);
        setSeats((prevSeats) =>
          prevSeats.map((seat) =>
            booked.some((b) => b.id === seat.id)
              ? { ...seat, status: 'booked' }
              : seat
          )
        );
        alert(`Booked Seats: ${booked.map((seat) => seat.id).join(', ')}`);
      })
      .catch((error) => alert('Error booking seats: ' + error.response?.data));
  };

  // Function to initialize/reset the seats
  const handleInitializeSeats = () => {
    axios
      .get('https://unstop-z41h.onrender.com/initialize')
      .then(() => {
        alert('Seats have been initialized.');
        fetchSeats(); // Refresh the seat grid after initialization
      })
      .catch((error) => alert('Error initializing seats: ' + error.response?.data));
  };

  return (
    <div>
      <h1>Train Seat Booking</h1>

      {/* Initialize Button */}
      <button onClick={handleInitializeSeats} style={{ marginBottom: '20px' }}>
        Initialize Seats
      </button>

      {/* Number of Seats to Book */}
      <div>
        <label>Number of Seats to Book: </label>
        <input
          type="number"
          min="1"
          max="7"
          value={numSeats}
          onChange={(e) => setNumSeats(Number(e.target.value))}
        />
      </div>

      {/* Seat Grid Display */}
      <div className="seats-grid" style={{ display: 'flex', flexDirection: 'column' }}>
        {Array.from({ length: 12 }, (_, rowIndex) => (
          <div key={rowIndex} style={{ display: 'flex', marginBottom: '5px' }}>
            {Array.from({ length: rowIndex === 11 ? 3 : 7 }, (_, seatIndex) => {
              const seatId = rowIndex * 7 + seatIndex + 1;
              const seat = seats.find((seat) => seat.id === seatId);
              if (!seat) return null; // Skip if seat doesn't exist

              return (
                <div
                  key={seatId}
                  className={`seat ${seat.status}`}
                  style={{
                    width: '40px',
                    height: '40px',
                    margin: '5px',
                    textAlign: 'center',
                    lineHeight: '40px',
                    backgroundColor:
                      seat.status === 'available'
                        ? 'green'
                        : seat.status === 'booked'
                        ? 'red'
                        : 'yellow',
                    cursor: seat.status === 'available' ? 'pointer' : 'not-allowed',
                  }}
                >
                  {seatId}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Button to Book Seats */}
      <button onClick={handleSeatBooking}>Book Seats</button>

      {/* Display Booked Seats */}
      <div>
        {bookedSeats.length > 0 && (
          <p>Booked Seats: {bookedSeats.map((seat) => seat.id).join(', ')}</p>
        )}
      </div>
    </div>
  );
};

export default SeatBooking;
