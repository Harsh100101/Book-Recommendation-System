import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import "./AdminPanel.css"; // ensure theme consistency

function AdminPanel() {
	const [bookData, setBookData] = useState({
		isbn: "",
		title: "",
		author: "",
		year: "",
		publisher: "",
		image_url_m: "",
		genre: "Fiction",
		price: "",
	});
	const [message, setMessage] = useState("");
	const [status, setStatus] = useState(""); // success/error
	const token = localStorage.getItem("token");

	const handleChange = (e) => {
		const { name, value } = e.target;
		setBookData({ ...bookData, [name]: value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setMessage("");
		setStatus("");
		const response = await fetch("http://127.0.0.1:5000/admin/add-book", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				...bookData,
				price: parseFloat(bookData.price) || 0,
			}),
		});

		const data = await response.json();
		setMessage(data.msg);
		setStatus(response.ok ? "success" : "error");
		if (response.ok) e.target.reset();
	};

	return (
		<div className="admin-container">
			<header className="admin-header">
				<img
					src="/admin1.png"
					alt="Admin Logo"
					className="admin-logo"
				/>
				<h1>Admin Control Panel</h1>
				<Link to="/" className="back-link">
					← Back to Main
				</Link>
			</header>

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="admin-card"
			>
				<h2>Add a New Book</h2>

				<form onSubmit={handleSubmit} className="admin-form">
					<div className="form-grid">
						<input
							name="title"
							placeholder="Book Title"
							onChange={handleChange}
							required
						/>
						<input
							name="author"
							placeholder="Author"
							onChange={handleChange}
							required
						/>
						<input
							name="isbn"
							placeholder="ISBN"
							onChange={handleChange}
							required
						/>
						<input
							name="year"
							placeholder="Publication Year"
							onChange={handleChange}
						/>
						<input
							name="publisher"
							placeholder="Publisher"
							onChange={handleChange}
						/>
						<input
							name="image_url_m"
							placeholder="Image URL (Medium)"
							onChange={handleChange}
						/>
						<input
							name="price"
							type="number"
							step="0.01"
							placeholder="Price"
							onChange={handleChange}
						/>
						<select
							name="genre"
							defaultValue="Fiction"
							onChange={handleChange}
						>
							<option>Fiction</option>
							<option>Mystery</option>
							<option>Science Fiction</option>
							<option>Fantasy</option>
							<option>Thriller</option>
							<option>Romance</option>
							<option>Non-Fiction</option>
							<option>Biography</option>
						</select>
					</div>

					<button type="submit" className="btn-submit">
						Add Book
					</button>
				</form>

				{message && (
					<p className={`message ${status}`}>
						{status === "success" ? "✅ " : "❌ "}
						{message}
					</p>
				)}
			</motion.div>

			{/* Live Preview Section */}
			{bookData.image_url_m && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className="book-preview"
				>
					<h3>📖 Live Preview</h3>
					<img
						src={bookData.image_url_m}
						alt="Book Preview"
						className="book-image"
						onError={(e) =>
							(e.target.src =
								"https://via.placeholder.com/150?text=No+Image")
						}
					/>
					<p>{bookData.title || "Book Title"}</p>
					<p className="author">{bookData.author || "Author"}</p>
				</motion.div>
			)}
		</div>
	);
}

export default AdminPanel;
