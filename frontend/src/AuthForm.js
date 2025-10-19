import React, { useState } from "react";

function AuthForm({ onLogin }) {
	const [view, setView] = useState("login"); // 'login', 'register', 'forgot', 'reset'
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [email, setEmail] = useState("");
	const [otp, setOtp] = useState("");
	const [message, setMessage] = useState("");

	const handleAuthSubmit = async (e) => {
		e.preventDefault();
		const isLogin = view === "login";
		const endpoint = isLogin ? "/login" : "/register";
		const body = isLogin
			? { username, password }
			: { username, password, email };

		const response = await fetch(`http://127.0.0.1:5000${endpoint}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		});
		const data = await response.json();

		if (response.ok) {
			if (isLogin) {
				onLogin(data.access_token);
			} else {
				setMessage("Registration successful! Please log in.");
				setView("login");
			}
		} else {
			setMessage(data.msg);
		}
	};

	const handleForgotSubmit = async (e) => {
		e.preventDefault();
		setMessage("Sending OTP...");
		const response = await fetch("http://127.0.0.1:5000/forgot-password", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email }),
		});
		const data = await response.json();
		setMessage(data.msg);
		if (response.ok) setView("reset");
	};

	const handleResetSubmit = async (e) => {
		e.preventDefault();
		setMessage("Resetting password...");
		const response = await fetch("http://127.0.0.1:5000/reset-password", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email, otp, new_password: password }),
		});
		const data = await response.json();
		setMessage(data.msg);
		if (response.ok) setView("login");
	};

	// Login/Register View
	if (view === "login" || view === "register") {
		const isLogin = view === "login";
		return (
			<div className="auth-page-background">
				<form className="form" onSubmit={handleAuthSubmit}>
					<p id="heading">{isLogin ? "Login" : "Sign Up"}</p>
					<div className="field">
						<svg className="input-icon" /* ... */></svg>
						<input
							className="input-field"
							type="text"
							placeholder="Username"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							required
						/>
					</div>
					{!isLogin && (
						<div className="field">
							<svg className="input-icon" /* ... */></svg>
							<input
								className="input-field"
								type="email"
								placeholder="Email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>
						</div>
					)}
					<div className="field">
						<svg className="input-icon" /* ... */></svg>
						<input
							className="input-field"
							type="password"
							placeholder="Password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
						/>
					</div>
					<div className="btn">
						<button className="button1" type="submit">
							{isLogin ? "Login" : "Sign Up"}
						</button>
						<button
							className="button2"
							type="button"
							onClick={() =>
								setView(isLogin ? "register" : "login")
							}
						>
							{isLogin ? "Sign Up" : "Login"}
						</button>
					</div>
					<button
						className="button3"
						type="button"
						onClick={() => setView("forgot")}
					>
						Forgot Password
					</button>
					{message && <p className="auth-message">{message}</p>}
				</form>
			</div>
		);
	}

	// Forgot Password View
	if (view === "forgot") {
		return (
			<div className="auth-page-background">
				<form className="form" onSubmit={handleForgotSubmit}>
					<p id="heading">Forgot Password</p>
					<div className="field">
						<svg className="input-icon" /* ... */></svg>
						<input
							className="input-field"
							type="email"
							placeholder="Enter your registered email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
					</div>
					<div className="btn">
						<button className="button1" type="submit">
							Send OTP
						</button>
					</div>
					<button
						className="button3"
						type="button"
						onClick={() => setView("login")}
					>
						Back to Login
					</button>
					{message && <p className="auth-message">{message}</p>}
				</form>
			</div>
		);
	}

	// Reset Password View
	if (view === "reset") {
		return (
			<div className="auth-page-background">
				<form className="form" onSubmit={handleResetSubmit}>
					<p id="heading">Reset Password</p>
					<div className="field">
						<svg className="input-icon" /* ... */></svg>
						<input
							className="input-field"
							type="text"
							placeholder="Enter OTP from email"
							value={otp}
							onChange={(e) => setOtp(e.target.value)}
							required
						/>
					</div>
					<div className="field">
						<svg className="input-icon" /* ... */></svg>
						<input
							className="input-field"
							type="password"
							placeholder="Enter New Password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
						/>
					</div>
					<div className="btn">
						<button className="button1" type="submit">
							Reset Password
						</button>
					</div>
					<button
						className="button3"
						type="button"
						onClick={() => setView("login")}
					>
						Back to Login
					</button>
					{message && <p className="auth-message">{message}</p>}
				</form>
			</div>
		);
	}
}

export default AuthForm;
