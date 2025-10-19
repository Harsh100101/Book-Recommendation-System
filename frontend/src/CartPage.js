import React from "react";
import { useLocation, Link } from "react-router-dom";

function CartPage() {
	const location = useLocation();
	const { cart } = location.state || { cart: [] };

	return (
		<div className="cart-page">
			<header className="cart-header">
				<h1>Your Shopping Cart ({cart.length} items)</h1>
				<Link to="/" className="back-link">
					← Continue Shopping
				</Link>
			</header>

			{cart.length === 0 ? (
				<p className="placeholder-text">Your cart is empty.</p>
			) : (
				<div className="cart-grid">
					{cart.map((book, index) => (
						<div
							key={`${book.isbn}-${index}`}
							className="neumorphic-card"
						>
							<img src={book.image} alt={book.title} />
							<h4>{book.title}</h4>
							<p>${(book.price || 0).toFixed(2)}</p>
							<a
								href={`https://www.amazon.com/s?k=${book.isbn}`}
								target="_blank"
								rel="noopener noreferrer"
								className="purchase-button"
							>
								Buy on Amazon 🛒
							</a>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

export default CartPage;
