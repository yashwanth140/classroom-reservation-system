import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function UserRegisterPage() {
  const [ssn, setSSN] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!ssn || !name || !email || !password) {
      alert('All fields required');
      return;
    }

    try {
      const res = await axios.post('/api/user/register', {
        ssn,
        name,
        email,
        password,
      });

      if (res.data.success) {
        alert('Registration successful. Please login.');
        navigate('/user/login');
      } else {
        alert(res.data.error || 'Registration failed');
      }
    } catch (err) {
      console.error(err);
      alert('Server error');
    }
  };

  return (
    <div>
      <h2>📝 Register as a New User</h2>
      <input
        placeholder="User SSN"
        value={ssn}
        onChange={(e) => setSSN(e.target.value)}
      /><br />
      <input
        placeholder="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      /><br />
      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      /><br />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      /><br />
      <button onClick={handleRegister}>Register</button>
    </div>
  );
}
