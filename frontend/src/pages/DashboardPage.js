// src/pages/DashboardPage.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import FeedbackForm from '../components/FeedbackForm';
import Notifications from '../components/Notifications';

export default function DashboardPage() {
  const [reservations, setReservations] = useState([]);
  const [userSSN, setUserSSN] = useState('');

  useEffect(() => {
    const ssn = localStorage.getItem('userSSN');
    if (ssn) setUserSSN(ssn);
  }, []);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const res = await axios.get('/api/reservations');
        setReservations(res.data);
      } catch (err) {
        console.error('Error loading reservations:', err);
      }
    };
    fetchReservations();
  }, []);

  return (
    <div>
      <h2>📋 Reservation Dashboard</h2>

      {/* Notification Section */}
      <Notifications userSSN={userSSN} />

      <hr />

      {/* Reservation Table */}
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>ID</th>
            <th>User Name</th>
            <th>Room</th>
            <th>Type</th>
            <th>Date</th>
            <th>Start</th>
            <th>End</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((row) => (
            <tr key={row.Reservation_ID}>
              <td>{row.Reservation_ID}</td>
              <td>{row.name}</td>
              <td>{row.Room_ID}</td>
              <td>{row.Reservation_type}</td>
              <td>{row.Reservation_date?.split('T')[0]}</td>
              <td>{row.start_time || '-'}</td>
              <td>{row.end_time || '-'}</td>
              <td>{row.Status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr />

      {/* Feedback Form Section */}
      <FeedbackForm userSSN={userSSN} />
    </div>
  );
}
