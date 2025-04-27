import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminPanel = () => {
    const [reservations, setReservations] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState({});
    const [selectedDate, setSelectedDate] = useState({});

    useEffect(() => {
        fetchReservations();
        fetchRooms();
    }, []);

    const fetchReservations = async () => {
        const res = await axios.get('http://localhost:5000/api/reservations/pending');
        setReservations(res.data);
    };

    const fetchRooms = async () => {
        const today = new Date().toISOString().split('T')[0];
        const res = await axios.get(`http://localhost:5000/api/available-rooms?date=${today}`);
        setRooms(res.data);
    };

    const handleRoomChange = (resId, value) => {
        setSelectedRoom(prev => ({ ...prev, [resId]: value }));
    };

    const handleDateChange = (resId, value) => {
        setSelectedDate(prev => ({ ...prev, [resId]: value }));
    };

    const handleApprove = async (id) => {
        const Room_ID = selectedRoom[id];
        const Reservation_date = selectedDate[id];

        if (!Room_ID || !Reservation_date) {
            alert("Please select both room and date before approving.");
            return;
        }

        try {
            await axios.put(`http://localhost:5000/api/reservations/${id}/approve`, {
                Room_ID,
                Reservation_date,
            });
            fetchReservations(); // Refresh the table
        } catch (err) {
            console.error("Approval error:", err);
        }
    };

    const handleReject = async (id) => {
        try {
            await axios.put(`http://localhost:5000/api/reservations/${id}/reject`);
            fetchReservations(); // Refresh the table
        } catch (err) {
            console.error("Rejection error:", err);
        }
    };

    const todayDate = new Date().toISOString().split('T')[0];

    return (
        <div style={{ padding: '2rem' }}>
            <h2>🛠️ Admin Panel – Pending Reservations</h2>
            <table border="1" cellPadding="10">
                <thead>
                    <tr>
                        <th>Reservation ID</th>
                        <th>Type</th>
                        <th>User SSN</th>
                        <th>Room ID</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {reservations.map(r => (
                        <tr key={r.Reservation_ID}>
                            <td>{r.Reservation_ID}</td>
                            <td>{r.Reservation_type}</td>
                            <td>{r.User_SSN}</td>
                            <td>
                                <select value={selectedRoom[r.Reservation_ID] || ''} onChange={(e) => handleRoomChange(r.Reservation_ID, e.target.value)}>
                                    <option value="">Select Room</option>
                                    {rooms.map(room => (
                                        <option key={room.Room_ID} value={room.Room_ID}>
                                            {room.Room_ID} (Cap: {room.Capacity})
                                        </option>
                                    ))}
                                </select>
                            </td>
                            <td>
                                <input
                                    type="date"
                                    min={todayDate}
                                    value={selectedDate[r.Reservation_ID] || ''}
                                    onChange={(e) => handleDateChange(r.Reservation_ID, e.target.value)}
                                />
                            </td>
                            <td>{r.Status}</td>
                            <td>
                                <button onClick={() => handleApprove(r.Reservation_ID)}>Approve</button>
                                <button onClick={() => handleReject(r.Reservation_ID)}>Reject</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminPanel;
