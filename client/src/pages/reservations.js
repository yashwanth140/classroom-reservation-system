import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Reservations() {
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/reservations')
      .then(res => setReservations(res.data))
      .catch(err => console.error('API Error:', err));
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>📅 Class Reservations</h2>
      <ul>
        {reservations.map(r => (
          <li key={r.Reservation_ID}>
            <strong>{r.Reservation_Type}</strong> reserved by <em>{r.User_SSN}</em>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Reservations;
