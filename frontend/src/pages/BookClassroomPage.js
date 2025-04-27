import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function BookClassroomPage() {
  const navigate = useNavigate();
  const [type, setType] = useState('Lab');
  const [ssn, setSsn] = useState('');
  const [date, setDate] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState('');

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser) {
      alert('Please login to access booking page');
      navigate('/user/login');
    } else {
      setSsn(storedUser.ssn);
    }
  }, [navigate]);

  const checkAvailability = async () => {
    try {
      const res = await axios.get(`/api/reservations/available-rooms`, {
        params: { date, start, end }
      });
      setRooms(res.data);
    } catch (err) {
      alert('Error fetching available rooms');
      console.error(err);
    }
  };

  const bookRoom = async () => {
    if (!selectedRoom) return alert('Please select a room');
    if (!date || !start || !end) return alert('Please fill in all date and time fields');

    const startTime = new Date(`${date}T${start}`);
    const endTime = new Date(`${date}T${end}`);
    const now = new Date();

    
    if (startTime < now) {
      alert('Start time cannot be in the past.');
      return;
    }

    
    if (startTime >= endTime) {
      alert('End time must be after start time.');
      return;
    }

    
    const durationHours = (endTime - startTime) / (1000 * 60 * 60);
    if (durationHours < 1 || durationHours > 3) {
      alert('Booking duration must be between 1 and 3 hours.');
      return;
    }

    try {
      await axios.post('/api/reservations', {
        Reservation_type: type,
        User_SSN: ssn,
        Room_ID: selectedRoom,
        Reservation_date: date,
        Start_time: start,
        End_time: end
      });
      alert('Room booking request submitted!');
    } catch (err) {
      console.error(err);
      alert('Booking failed');
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>📅 Book a Room</h2>

        <label>Room Type</label>
        <input value={type} onChange={(e) => setType(e.target.value)} />

        <label>User SSN</label>
        <input value={ssn} readOnly />

        <label>Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          min={new Date().toISOString().split("T")[0]} 
        />

        <label>Start Time</label>
        <input type="time" value={start} onChange={(e) => setStart(e.target.value)} />

        <label>End Time</label>
        <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} />

        <button onClick={checkAvailability}>Check Availability</button>

        {rooms.length > 0 && (
          <>
            <label>Select Room</label>
            <select value={selectedRoom} onChange={(e) => setSelectedRoom(e.target.value)}>
              <option value="">Select Room</option>
              {rooms.map((room) => (
                <option key={room.Room_ID} value={room.Room_ID}>
                  {room.Room_ID} - {room.Room_name} ({room.Capacity} seats)
                </option>
              ))}
            </select>
          </>
        )}

        <button onClick={bookRoom}>Book Room</button>
      </div>
    </div>
  );
}
