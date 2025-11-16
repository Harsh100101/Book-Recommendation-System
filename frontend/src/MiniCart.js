import React from "react"; // Corrected: Removed duplicate import
import { Link } from "react-router-dom";

function MiniCart({ cart, isOpen, onClose, onRemove }) {
	const subtotal = cart
		.reduce((sum, book) => sum + (book.price || 0), 0)
		.toFixed(2);

	return (
		<div className={`mini-cart-panel ${isOpen ? "open" : ""}`}>
			<div className="mini-cart-header">
				<h2>My Cart ({cart.length})</h2>
				<button className="close-btn" onClick={onClose}>
					&times;
				</button>
			</div>
			<div className="mini-cart-items">
				{cart.length === 0 ? (
					<p className="placeholder-text">Your cart is empty.</p>
				) : (
					cart.map((item, index) => (
						<div
							key={`${item.isbn}-${index}`}
							className="mini-cart-item"
						>
							<img
								src={item.image}
								alt={item.title}
								className="mini-cart-item-image"
							/>
							<div className="mini-cart-item-details">
								<h4>{item.title}</h4>
								<p>${item.price}</p>
								<button
									className="remove-btn"
									onClick={() => onRemove(item.isbn)}
								>
									&times;
								</button>
							</div>
						</div>
					))
				)}
			</div>
			<div className="mini-cart-summary">
				<div className="subtotal">
					<span>Subtotal:</span>
					<span>${subtotal}</span>
				</div>

				{/* --- THIS IS THE UPDATED SECTION --- */}
				<div className="mini-cart-actions">
					{/* This is now a Link component that navigates to the /cart page */}
					<Link
						to="/cart"
						state={{ cart: cart }}
						className="primary-button"
					>
						View Cart & Checkout
					</Link>
				</div>
				{/* --- END OF UPDATED SECTION --- */}
			</div>
		</div>
	);
}

export default MiniCart;
