import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./VerificationModal.css";

function VerificationModal({ token, onVerified, onClose }) {
	const [otp, setOtp] = useState("");
	const [message, setMessage] = useState("");
	const [otpSent, setOtpSent] = useState(false);

	const handleSendOtp = async () => {
		setMessage("Sending OTP...");
		const response = await fetch(
			"http://127.0.0.1:5000/send-verification-otp",
			{
				method: "POST",
				headers: { Authorization: `Bearer ${token}` },
			}
		);
		const data = await response.json();
		setMessage(data.msg);
		if (response.ok) setOtpSent(true);
	};

	const handleVerifyOtp = async (e) => {
		e.preventDefault();
		setMessage("Verifying...");
		const response = await fetch("http://127.0.0.1:5000/verify-otp", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ otp }),
		});
		const data = await response.json();
		setMessage(data.msg);
		if (response.ok) {
			setTimeout(() => {
				onVerified();
				onClose();
			}, 1500);
		}
	};

	return (
		<AnimatePresence>
			<div className="verification-overlay">
				<motion.div
					className="verification-modal"
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					exit={{ opacity: 0, scale: 0.9 }}
					transition={{ duration: 0.3 }}
				>
					<h2>Email Verification Required</h2>
					<p>
						Please verify your email to continue using full
						features.
					</p>

					{!otpSent ? (
						<button
							onClick={handleSendOtp}
							className="send-otp-btn"
						>
							Send Verification Code
						</button>
					) : (
						<form onSubmit={handleVerifyOtp} className="otp-form">
							<input
								type="text"
								placeholder="Enter OTP"
								value={otp}
								onChange={(e) => setOtp(e.target.value)}
								required
							/>
							<button type="submit" className="verify-btn">
								Verify Email
							</button>
						</form>
					)}

					{message && <p className="modal-message">{message}</p>}

					<button onClick={onClose} className="close-modal">
						×
					</button>
				</motion.div>
			</div>
		</AnimatePresence>
	);
}

export default VerificationModal;
