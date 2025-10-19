import React, { useState } from "react";

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
				onVerified(); // Refresh user profile
				onClose(); // Close the modal
			}, 1500);
		}
	};

	return (
		<div className="modal-backdrop">
			<div className="modal-content">
				<h2>Email Verification Required</h2>
				<p>Please verify your email to rate books.</p>
				{!otpSent ? (
					<button onClick={handleSendOtp}>
						Send Verification Code
					</button>
				) : (
					<form onSubmit={handleVerifyOtp}>
						<input
							type="text"
							placeholder="Enter OTP from email"
							value={otp}
							onChange={(e) => setOtp(e.target.value)}
							required
						/>
						<button type="submit">Verify</button>
					</form>
				)}
				{message && <p className="modal-message">{message}</p>}
				<button onClick={onClose} className="close-button">
					&times;
				</button>
			</div>
		</div>
	);
}

export default VerificationModal;
