import React, { useState } from "react";

// Client-side regex for password validation
const PASSWORD_REGEX = /^(?=.*[0-9])(?=.*[^A-Za-z0-9]).{6,}$/;
const PASSWORD_ERROR_MSG =
	"Password must be at least 6 characters long and include one digit and one special character.";

function AuthForm({ onLogin }) {
	const [view, setView] = useState("login"); // State for current view: 'login', 'register', 'forgot', 'reset'
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [email, setEmail] = useState("");
	const [otp, setOtp] = useState("");
	const [message, setMessage] = useState("");

	// --- HANDLERS ---
	const handleAuthSubmit = async (e) => {
		e.preventDefault();
		const isLogin = view === "login";
		const endpoint = isLogin ? "/login" : "/register";
		const body = isLogin
			? { username, password }
			: { username, password, email };

		if (!isLogin && !PASSWORD_REGEX.test(password)) {
			setMessage(PASSWORD_ERROR_MSG);
			return;
		}

		const response = await fetch(
			`${process.env.REACT_APP_API_URL}${endpoint}`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			}
		);
		const data = await response.json();

		if (response.ok) {
			if (isLogin) {
				onLogin(data.access_token);
			} else {
				setMessage("Registration successful! Please log in.");
				setView("login");
			}
		} else {
			setMessage(data.msg || "An unknown error occurred.");
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

		if (!PASSWORD_REGEX.test(password)) {
			setMessage(PASSWORD_ERROR_MSG);
			return;
		}

		setMessage("Resetting password...");
		const response = await fetch("http://127.0.0.1:5000/reset-password", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email, otp, new_password: password }),
		});
		const data = await response.json();

		if (response.ok) {
			setMessage(data.msg);
			setView("login");
		} else {
			setMessage(data.msg);
		}
	};

	// --- JSX RENDERING ---
	const currentView =
		view === "login" || view === "register"
			? view === "login"
				? "Login"
				: "Sign Up"
			: view === "forgot"
			? "Forgot Password"
			: "Reset Password";
	const submitHandler =
		view === "login" || view === "register"
			? handleAuthSubmit
			: view === "forgot"
			? handleForgotSubmit
			: handleResetSubmit;
	const isLoginView = view === "login";
	const isRegisterView = view === "register";
	const isForgotView = view === "forgot";
	const isResetView = view === "reset";

	const UserIcon = (props) => (
		<svg
			className="input-icon"
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			fill="currentColor"
			viewBox="0 0 16 16"
		>
			<path d="M13.106 7.222c0-2.967-2.249-5.032-5.482-5.032-3.35 0-5.646 2.318-5.646 5.702 0 3.493 2.235 5.708 5.762 5.708.862 0 1.689-.123 2.304-.335v-.862c-.43.199-1.354.328-2.29.328-2.926 0-4.813-1.88-4.813-4.798 0-2.844 1.921-4.881 4.594-4.881 2.735 0 4.608 1.688 4.608 4.156 0 1.682-.554 2.769-1.416 2.769-.492 0-.772-.28-.772-.76V5.206H8.923v.834h-.11c-.266-.595-.881-.964-1.6-.964-1.4 0-2.378 1.162-2.378 2.823 0 1.737.957 2.906 2.379 2.906.8 0 1.415-.39 1.709-1.087h.11c.081.67.703 1.148 1.503 1.148 1.572 0 2.57-1.415 2.57-3.643zm-7.177.704c0-1.197.54-1.907 1.456-1.907.93 0 1.524.738 1.524 1.907S8.308 9.84 7.371 9.84c-.895 0-1.442-.725-1.442-1.914z"></path>
		</svg>
	);
	const LockIcon = (props) => (
		<svg
			className="input-icon"
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			fill="currentColor"
			viewBox="0 0 16 16"
		>
			<path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"></path>
		</svg>
	);
	const MailIcon = (props) => (
		<svg
			className="input-icon"
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			fill="currentColor"
			viewBox="0 0 16 16"
		>
			<path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414.05 3.555ZM0 4.697v7.104l5.803-3.558L0 4.697ZM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586l-1.239-.757ZM16 4.697v7.104l-5.803-3.558L16 4.697Z" />
		</svg>
	);
	const CodeIcon = (props) => (
		<svg
			className="input-icon"
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			fill="currentColor"
			viewBox="0 0 16 16"
		>
			<path d="M.5 1a.5.5 0 0 0 0 1h15a.5.5 0 0 0 0-1H.5zm15 2H.5a.5.5 0 0 0-.5.5v12a.5.5 0 0 0 .5.5h15a.5.5 0 0 0 .5-.5v-12a.5.5 0 0 0-.5-.5zM12 9a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-1 0v-1a.5.5 0 0 1 .5-.5zm-4 0a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-1 0v-1a.5.5 0 0 1 .5-.5zm-4 0a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-1 0v-1a.5.5 0 0 1 .5-.5z" />
		</svg>
	);

	return (
		<div className="auth-page-background">
			<form className="form" onSubmit={submitHandler}>
				<p id="heading">{currentView}</p>

				{/* --- Input Fields --- */}

				{/* Username or Email for Forgot Password */}
				{(isLoginView || isRegisterView || isForgotView) && (
					<div className="field">
						{view === "forgot" ? <MailIcon /> : <UserIcon />}
						<input
							className="input-field"
							type={view === "forgot" ? "email" : "text"}
							placeholder={
								view === "forgot"
									? "Registered Email"
									: "Username"
							}
							value={view === "forgot" ? email : username}
							onChange={(e) =>
								view === "forgot"
									? setEmail(e.target.value)
									: setUsername(e.target.value)
							}
							required
						/>
					</div>
				)}

				{/* Email for Registration */}
				{isRegisterView && (
					<div className="field">
						<MailIcon />
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

				{/* Password for Login/Register/Reset */}
				{(isLoginView || isRegisterView || isResetView) && (
					<div className="field">
						<LockIcon />
						<input
							className="input-field"
							type="password"
							placeholder={
								isResetView ? "New Password" : "Password"
							}
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
						/>
					</div>
				)}

				{/* OTP for Reset */}
				{isResetView && (
					<div className="field">
						<CodeIcon />
						<input
							className="input-field"
							type="text"
							placeholder="OTP from Email"
							value={otp}
							onChange={(e) => setOtp(e.target.value)}
							required
						/>
					</div>
				)}

				{/* --- Buttons --- */}
				<div className="btn">
					{isLoginView || isRegisterView ? (
						<>
							<button className="button1" type="submit">
								{isLoginView ? "Login" : "Register"}
							</button>
							<button
								className="button2"
								type="button"
								onClick={() =>
									setView(isLoginView ? "register" : "login")
								}
							>
								{isLoginView ? "Sign Up" : "Login"}
							</button>
						</>
					) : (
						<button className="button1" type="submit">
							{isForgotView ? "Send Code" : "Reset Password"}
						</button>
					)}
				</div>

				<button
					className="button3"
					type="button"
					onClick={() => setView(isLoginView ? "forgot" : "login")}
				>
					{isLoginView
						? "Forgot Password?"
						: isRegisterView
						? "Back to Login"
						: "Back to Login"}
				</button>
				{message && <p className="auth-message">{message}</p>}
			</form>
		</div>
	);
}

export default AuthForm;
