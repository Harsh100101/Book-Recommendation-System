import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import "./App.css";
import AuthForm from "./AuthForm";
import MyRatings from "./MyRatings";
import AdminPanel from "./AdminPanel";
import MiniCart from "./MiniCart";
import CartPage from "./CartPage";
import VerificationModal from "./VerificationModal";

// --- Debounce Hook (Helper Function) ---
const useDebounce = (value, delay) => {
	const [debouncedValue, setDebouncedValue] = useState(value);
	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);
		return () => {
			clearTimeout(handler);
		};
	}, [value, delay]);
	return debouncedValue;
};

// --- Main Page Component ---
function MainPage() {
	const token = localStorage.getItem("token");
	const [profile, setProfile] = useState(null);
	const [books, setBooks] = useState([]);
	const [recommendations, setRecommendations] = useState([]);
	const [loadingBooks, setLoadingBooks] = useState(true);
	const [loadingRecs, setLoadingRecs] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [genre, setGenre] = useState("all");
	const [price, setPrice] = useState(40);
	const [cart, setCart] = useState([]);
	const [isCartOpen, setIsCartOpen] = useState(false);
	const [showVerificationModal, setShowVerificationModal] = useState(false);

	const debouncedSearchTerm = useDebounce(searchTerm, 500);
	const debouncedPrice = useDebounce(price, 500);

	const fetchProfile = useCallback(() => {
		if (token) {
			fetch("http://127.0.0.1:5000/profile", {
				headers: { Authorization: `Bearer ${token}` },
			})
				.then((res) => res.json())
				.then((data) => setProfile(data));
		}
	}, [token]);

	useEffect(() => {
		fetchProfile();
	}, [fetchProfile]);

	useEffect(() => {
		const savedCart = localStorage.getItem("userCart");
		if (savedCart && JSON.parse(savedCart).length > 0) {
			if (
				window.confirm(
					"Welcome back! We see you have items from your last session. Would you like to review them?"
				)
			) {
				// In a real app, you might redirect to a /journal page here
			}
			localStorage.removeItem("userCart");
		}
	}, []);

	const handleLogout = () => {
		localStorage.removeItem("token");
		window.location.reload();
	};

	const rateBook = async (title, rating) => {
		if (profile && !profile.is_verified) {
			setShowVerificationModal(true);
			return;
		}
		if (!token) {
			alert("Please log in to rate a book.");
			return;
		}
		await fetch("http://127.0.0.1:5000/rate", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ title, rating }),
		});
		fetchBooks(); // Refresh books to show the new rating
	};

	const fetchBooks = useCallback(() => {
		setLoadingBooks(true);
		const url = `http://127.0.0.1:5000/search?q=${debouncedSearchTerm}&genre=${genre}&price=${debouncedPrice}`;
		const headers = {};
		if (token) {
			headers["Authorization"] = `Bearer ${token}`;
		}
		fetch(url, { headers })
			.then((res) => res.json())
			.then((data) => {
				setBooks(data);
				setLoadingBooks(false);
			})
			.catch((error) => {
				console.error("Error fetching books:", error);
				setLoadingBooks(false);
			});
	}, [debouncedSearchTerm, genre, debouncedPrice, token]);

	useEffect(() => {
		fetchBooks();
	}, [fetchBooks]);

	const getRecommendations = (bookIsbn) => {
		setLoadingRecs(true);
		setRecommendations([]);
		fetch(
			`http://127.0.0.1:5000/recommend?isbn=${encodeURIComponent(
				bookIsbn
			)}`
		)
			.then((res) => res.json())
			.then((data) => {
				setRecommendations(data);
				setLoadingRecs(false);
			})
			.catch((error) => {
				console.error("Error fetching recommendations:", error);
				setLoadingRecs(false);
			});
	};

	const addToCart = (book) => {
		const newCart = [...cart, book];
		setCart(newCart);
		localStorage.setItem("userCart", JSON.stringify(newCart));
		setIsCartOpen(true);
	};

	const genres = [
		"all",
		"Fiction",
		"Mystery",
		"Science Fiction",
		"Fantasy",
		"Thriller",
		"Romance",
		"Non-Fiction",
		"Biography",
	];

	return (
		<div className="App">
			{showVerificationModal && (
				<VerificationModal
					token={token}
					onClose={() => setShowVerificationModal(false)}
					onVerified={fetchProfile} // Re-fetch profile on success
				/>
			)}
			<MiniCart
				cart={cart}
				isOpen={isCartOpen}
				onClose={() => setIsCartOpen(false)}
			/>
			<header>
				<h1>📚 Advanced Book Recommender</h1>
				<nav>
					{profile && profile.is_admin && (
						<Link to="/admin" className="nav-link">
							Admin Panel
						</Link>
					)}
					<Link to="/my-ratings" className="nav-link">
						My Ratings
					</Link>
					<button onClick={handleLogout} className="logout-button">
						Logout
					</button>
				</nav>
			</header>

			<div className="filters">
				<input
					type="text"
					placeholder="Search by title..."
					className="search-input"
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
				/>
				<select
					value={genre}
					onChange={(e) => setGenre(e.target.value)}
					className="genre-select"
				>
					{genres.map((g) => (
						<option key={g} value={g}>
							{g === "all" ? "All Genres" : g}
						</option>
					))}
				</select>
				<div className="price-slider">
					<label>Max Price: ${price}</label>
					<input
						type="range"
						min="5"
						max="40"
						value={price}
						onChange={(e) => setPrice(e.target.value)}
					/>
				</div>
			</div>

			<main className="main-content">
				<div className="book-list-container">
					<h2>Search Results</h2>
					{loadingBooks ? (
						<p>Loading books...</p>
					) : (
						<div className="book-grid">
							{books.map((book) => (
								<div
									key={book.isbn}
									className="book-card"
									onClick={() =>
										getRecommendations(book.isbn)
									}
								>
									<img
										src={book.image}
										alt={`Cover of ${book.title}`}
									/>
									<div className="book-info">
										<h4>{book.title}</h4>
										<p>{book.author}</p>
										<div className="average-rating">
											{book.rating_count > 0 ? (
												<>
													<span>
														{Number(
															book.average_rating
														).toFixed(1)}{" "}
														★
													</span>
													<span className="rating-count">
														({book.rating_count}{" "}
														ratings)
													</span>
												</>
											) : (
												<span className="rating-count">
													No ratings yet
												</span>
											)}
										</div>
										<p className="price-genre">
											${book.price} | {book.genre}
										</p>
										<div className="rating-stars">
											{[5, 4, 3, 2, 1].map((star) => (
												<React.Fragment key={star}>
													<input
														value={star}
														name={`rating-${book.isbn}`}
														id={`star-${book.isbn}-${star}`}
														type="radio"
														checked={
															book.user_rating ===
															star
														}
														onChange={(e) => {
															e.stopPropagation();
															rateBook(
																book.title,
																star
															);
														}}
													/>
													<label
														htmlFor={`star-${book.isbn}-${star}`}
														onClick={(e) =>
															e.stopPropagation()
														}
													></label>
												</React.Fragment>
											))}
										</div>
										<button
											className="purchase-button"
											onClick={(e) => {
												e.stopPropagation();
												addToCart(book);
											}}
										>
											Add to Cart 🛒
										</button>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
				<div className="recommendation-container">
					<h2>Recommendations</h2>
					{loadingRecs ? (
						<p>Loading recommendations...</p>
					) : recommendations.length > 0 ? (
						recommendations.map((rec) => (
							<div key={rec.isbn} className="rec-card">
								<img
									src={rec.image}
									alt={`Cover of ${rec.title}`}
								/>
								<div className="rec-info">
									<h4>{rec.title}</h4>
									<p>{rec.author}</p>
									<button
										className="purchase-button small"
										onClick={(e) => {
											e.stopPropagation();
											addToCart(rec);
										}}
									>
										Add
									</button>
								</div>
							</div>
						))
					) : (
						<p className="placeholder-text">
							Click on a book to see recommendations.
						</p>
					)}
				</div>
			</main>
		</div>
	);
}

// --- Main App Component (Router Logic) ---
function App() {
	const [token, setToken] = useState(localStorage.getItem("token"));

	const handleLogin = (newToken) => {
		localStorage.setItem("token", newToken);
		setToken(newToken);
	};

	return (
		<BrowserRouter>
			<Routes>
				<Route
					path="/"
					element={
						token ? (
							<MainPage />
						) : (
							<AuthForm onLogin={handleLogin} />
						)
					}
				/>
				<Route
					path="/my-ratings"
					element={
						token ? (
							<MyRatings />
						) : (
							<AuthForm onLogin={handleLogin} />
						)
					}
				/>
				<Route
					path="/admin"
					element={
						token ? (
							<AdminPanel />
						) : (
							<AuthForm onLogin={handleLogin} />
						)
					}
				/>
				<Route
					path="/cart"
					element={
						token ? (
							<CartPage />
						) : (
							<AuthForm onLogin={handleLogin} />
						)
					}
				/>
				<Route
					path="*"
					element={
						token ? (
							<MainPage />
						) : (
							<AuthForm onLogin={handleLogin} />
						)
					}
				/>
			</Routes>
		</BrowserRouter>
	);
}

export default App;
