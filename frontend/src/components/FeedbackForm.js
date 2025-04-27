import React, { useState } from 'react';
import axios from 'axios';

const FeedbackForm = ({ userSSN }) => {
  const [rating, setRating] = useState('');
  const [comment, setComment] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/feedback/submit', { rating, comment, user_ssn: userSSN });
      setSuccess(true);
      setRating('');
      setComment('');
    } catch (err) {
      alert('Error submitting feedback');
    }
  };

  return (
    <div>
      <h3>Submit Feedback</h3>
      {success && <p style={{ color: 'green' }}>Thank you for your feedback!</p>}
      <form onSubmit={handleSubmit}>
        <label>Rating (1-5):</label>
        <input type="number" value={rating} min="1" max="5" onChange={(e) => setRating(e.target.value)} required />
        <br />
        <label>Comment:</label>
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} required />
        <br />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default FeedbackForm;
