import React, { useState } from "react";
import { Link } from "react-router-dom";

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
	const token = localStorage.getItem("token");

	const handleChange = (e) => {
		const { name, value } = e.target;
		setBookData({ ...bookData, [name]: value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setMessage("");
		const response = await fetch("http://127.0.0.1:5000/admin/add-book", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				...bookData,
				price: parseFloat(bookData.price) || 0, // Ensure price is a number
			}),
		});
		const data = await response.json();
		setMessage(data.msg);
		if (response.ok) {
			e.target.reset(); // Clear form on success
		}
	};

	return (
		<div className="admin-panel-page">
			<header className="ratings-header">
				<h1>Admin Panel</h1>
				<Link to="/" className="back-link">
					← Back to Main Site
				</Link>
			</header>
			<div className="admin-content">
				<h2>Add a New Book</h2>
				<form onSubmit={handleSubmit} className="add-book-form">
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
						<option>Fiction</option> <option>Mystery</option>{" "}
						<option>Science Fiction</option>
						<option>Fantasy</option> <option>Thriller</option>{" "}
						<option>Romance</option>
						<option>Non-Fiction</option> <option>Biography</option>
					</select>
					<button type="submit">Add Book</button>
				</form>
				{message && <p className="form-message">{message}</p>}
			</div>
		</div>
	);
}

export default AdminPanel;
