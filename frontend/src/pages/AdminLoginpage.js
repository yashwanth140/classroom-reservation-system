// src/pages/AdminLoginPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminLoginPage({ setIsAdmin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // ✅ Redirect if already logged in as admin
  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    if (isAdmin === 'true') {
      window.location.href = '/admin/approve';
    }
  }, []);

  const handleLogin = async () => {
    if (!username || !password) {
      alert('Username and password required');
      return;
    }

    try {
      const res = await axios.post('/api/admin/login', { username, password });

      if (res.data.success) {
        localStorage.setItem('isAdmin', 'true');
        localStorage.setItem('adminName', res.data.admin?.username || 'Admin');

        if (setIsAdmin) setIsAdmin(true);

        // Force reload to ensure proper route render
        window.location.href = '/admin/approve';
      } else {
        alert(res.data.error || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Login error:', err);
      alert('Login failed');
    }
  };

  return (
    <div className="container">
      <h2>🔐 Admin Login</h2>

      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      /><br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      /><br />

      <button onClick={handleLogin}>Login</button>
    </div>
  );
}
