import React, { useState } from "react";

function AuthForm({ onLogin }) {
	const [isLogin, setIsLogin] = useState(true);
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [email, setEmail] = useState("");
	const [message, setMessage] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();
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
				setIsLogin(true); // Switch to login view
			}
		} else {
			setMessage(data.msg);
		}
	};

	return (
		<div className="auth-page-background">
			<div className="auth-container form-container">
				<h2>{isLogin ? "Welcome Back" : "Create Account"}</h2>
				<form onSubmit={handleSubmit}>
					<div className="form-group">
						<input
							id="username"
							type="text"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							placeholder=" "
							required
						/>
						<label htmlFor="username">Username</label>
					</div>

					{!isLogin && (
						<div className="form-group">
							<input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder=" "
								required
							/>
							<label htmlFor="email">Email</label>
						</div>
					)}

					<div className="form-group">
						<input
							id="password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder=" "
							required
						/>
						<label htmlFor="password">Password</label>
					</div>

					<button type="submit" className="submit-button">
						{isLogin ? "Login" : "Register"}
					</button>
				</form>
				<button
					onClick={() => setIsLogin(!isLogin)}
					className="form-link"
				>
					{isLogin
						? "Need an account? Register"
						: "Have an account? Login"}
				</button>
				{message && <p className="auth-message">{message}</p>}
			</div>
		</div>
	);
}
export default AuthForm;
