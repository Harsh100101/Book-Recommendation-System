import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Used to link back to the main page

function MyRatings() {
  const [ratedBooks, setRatedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    // Don't fetch if the user isn't logged in
    if (!token) {
      setLoading(false);
      return;
    }

    // Fetch the user's ratings from the protected backend endpoint
    fetch('http://127.0.0.1:5000/my-ratings', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => {
      // First, check if the response from the server was successful
      if (!response.ok) {
        console.error('API Error:', response.status, response.statusText);
        // Don't proceed if there's an error (e.g., 401 Unauthorized for an expired token)
        throw new Error('Failed to fetch ratings.'); 
      }
      return response.json();
    })
    .then(data => {
      // Double-check that the data received is actually an array before setting the state
      if (Array.isArray(data)) {
        setRatedBooks(data);
      } else {
        console.error("Data received is not an array:", data);
      }
      setLoading(false);
    })
    .catch(error => {
      console.error("Error fetching ratings:", error);
      setRatedBooks([]); // Reset to an empty array on any error to prevent crashing
      setLoading(false);
    });
  }, [token]); // This effect re-runs if the token changes

  // Display a loading message while data is being fetched
  if (loading) {
    return <div className="loading-page">Loading your ratings...</div>;
  }

  return (
    <div className="my-ratings-page">
      <header className="ratings-header">
        <h1>My Rated Books</h1>
        <Link to="/" className="back-link">← Back to Search</Link>
      </header>
      
      {/* Conditionally render the list or a placeholder message */}
      {ratedBooks.length === 0 ? (
        <p className="placeholder-text">You haven't rated any books yet.</p>
      ) : (
        <div className="ratings-grid">
          {ratedBooks.map(book => (
            <div key={book.isbn} className="rated-book-card">
              <img src={book.image} alt={`Cover of ${book.title}`} />
              <div className="book-info">
                <h4>{book.title}</h4>
                <p>{book.author}</p>
                <p className="user-rating">You rated: {'⭐'.repeat(book.user_rating)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyRatings;