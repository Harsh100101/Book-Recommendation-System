import React from "react";
import { useLocation, Link } from "react-router-dom";

function CartPage() {
	// Read the cart data passed from the Link component
	const location = useLocation();
	const { cart } = location.state || { cart: [] };

	const subtotal = cart
		.reduce((sum, book) => sum + (book.price || 0), 0)
		.toFixed(2);

	return (
		<div className="cart-page">
			<header className="cart-header">
				<h1>Your Shopping Cart</h1>
				<Link to="/" className="back-link">
					← Continue Shopping
				</Link>
			</header>

			{cart.length === 0 ? (
				<p className="placeholder-text">Your cart is empty.</p>
			) : (
				<div className="cart-contents">
					<div className="cart-items-list">
						{cart.map((book, index) => (
							<div
								key={`${book.isbn}-${index}`}
								className="cart-item-row"
							>
								<img src={book.image} alt={book.title} />
								<div className="item-details">
									<h4>{book.title}</h4>
									<p>{book.author}</p>
								</div>
								<div className="item-price">
									${book.price.toFixed(2)}
								</div>
								<div className="item-action">
									<a
										href={`https://www.amazon.com/s?k=${book.isbn}`}
										target="_blank"
										rel="noopener noreferrer"
										className="purchase-button"
									>
										Buy on Amazon 🛒
									</a>
								</div>
							</div>
						))}
					</div>
					<div className="cart-summary">
						<h2>Order Summary</h2>
						<div className="summary-row">
							<span>Subtotal ({cart.length} items)</span>
							<span>${subtotal}</span>
						</div>
						<div className="summary-row total">
							<span>Total</span>
							<span>${subtotal}</span>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default CartPage;
