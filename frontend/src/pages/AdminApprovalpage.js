import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function AdminApprovalPage() {
  const [pending, setPending] = useState([]);
  const navigate = useNavigate();

  const fetchPending = async () => {
    try {
      const res = await axios.get('/api/reservations/pending');
      setPending(res.data);
    } catch (err) {
      console.error('Fetch error:', err);
      alert('Failed to load pending reservations');
    }
  };

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    if (!isAdmin) {
      alert('Access denied');
      navigate('/admin/login');
    } else {
      fetchPending();
    }
  }, [navigate]);

  const handleApprove = async (id, room, rawDate, start, end) => {
    const date = new Date(rawDate).toISOString().split('T')[0];
    try {
      await axios.put(`/api/reservations/${id}/approve`, {
        Room_ID: room,
        Reservation_date: date,
        Start_time: start,
        End_time: end,
      });
      alert('Reservation approved');
      fetchPending();
    } catch (err) {
      console.error('Approval error:', err);
      alert('Error approving reservation');
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.put(`/api/reservations/${id}/reject`);
      alert('Reservation rejected');
      fetchPending();
    } catch (err) {
      console.error('Rejection error:', err);
      alert('Error rejecting reservation');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    navigate('/admin/login');
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>🛠️ Admin – Pending Reservation Approvals</h2>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>

      <table border="1" style={{ width: '100%', textAlign: 'center' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>User SSN</th>
            <th>Type</th>
            <th>Room</th>
            <th>Date</th>
            <th>Start</th>
            <th>End</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {pending.length === 0 ? (
            <tr>
              <td colSpan="9">No pending reservations</td>
            </tr>
          ) : (
            pending.map((row) => (
              <tr key={row.Reservation_ID}>
                <td>{row.Reservation_ID}</td>
                <td>{row.User_SSN}</td>
                <td>{row.Reservation_type}</td>
                <td>{row.Room_ID}</td>
                <td>{row.Reservation_date?.split('T')[0]}</td>
                <td>{row.start_time}</td>
                <td>{row.end_time}</td>
                <td>
                  <button
                    onClick={() =>
                      handleApprove(
                        row.Reservation_ID,
                        row.Room_ID,
                        row.Reservation_date,
                        row.start_time,
                        row.end_time
                      )
                    }
                  >
                    Approve
                  </button>
                  <button onClick={() => handleReject(row.Reservation_ID)}>Reject</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
