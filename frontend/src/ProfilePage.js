import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";

// Placeholder data while loading
const EMPTY_PROFILE = {
	username: "Loading...",
	email: "Loading...",
	is_verified: false,
	is_admin: false,
	profile_photo_url: "https://via.placeholder.com/150/444/999?text=U",
};

const DUMMY_STATS = { total_ratings: 0, total_books_renewed: 0 };

function ProfilePage() {
	const token = localStorage.getItem("token");
	const [profile, setProfile] = useState(EMPTY_PROFILE);
	const [stats, setStats] = useState(DUMMY_STATS);
	const [isLoading, setIsLoading] = useState(true);
	const [newPassword, setNewPassword] = useState("");
	const [message, setMessage] = useState("");
	const [photoPreview, setPhotoPreview] = useState(
		EMPTY_PROFILE.profile_photo_url
	);
	const navigate = useNavigate();

	// --- Fetch user profile and stats ---
	const fetchUserData = useCallback(() => {
		if (!token) {
			setIsLoading(false);
			return;
		}

		const API_URL = "http://127.0.0.1:5000";
		const authHeaders = { Authorization: `Bearer ${token}` };

		const fetchProfileData = fetch(`${API_URL}/profile`, {
			headers: authHeaders,
		}).then((res) => res.json());

		const fetchStatsData = fetch(`${API_URL}/user-stats`, {
			headers: authHeaders,
		})
			.then((res) => (res.ok ? res.json() : DUMMY_STATS))
			.catch(() => DUMMY_STATS);

		Promise.all([fetchProfileData, fetchStatsData])
			.then(([profileData, statsData]) => {
				if (profileData?.username) {
					setProfile({
						...profileData,
						email: profileData.email || "Not Available",
					});
					setPhotoPreview(
						profileData.profile_photo_url ||
							EMPTY_PROFILE.profile_photo_url
					);
				}
				if (statsData) setStats(statsData);
				setIsLoading(false);
			})
			.catch((error) => {
				console.error("Failed to fetch profile data:", error);
				setIsLoading(false);
			});
	}, [token]);

	useEffect(() => {
		fetchUserData();
	}, [fetchUserData]);

	// --- Handle photo change ---
	const handlePhotoChange = (e) => {
		const file = e.target.files[0];
		if (!file) return;

		// Show local preview immediately
		setPhotoPreview(URL.createObjectURL(file));

		// Upload file
		handlePhotoUpload(file);
	};

	// --- Upload photo to backend ---
	const handlePhotoUpload = async (file) => {
		const API_URL = "http://127.0.0.1:5000";
		const token = localStorage.getItem("token");

		if (!file) return;

		const formData = new FormData();
		formData.append("file", file);

		setMessage("Uploading photo...");

		try {
			const response = await fetch(`${API_URL}/upload-profile-photo`, {
				method: "POST",
				headers: { Authorization: `Bearer ${token}` },
				body: formData,
			});

			const data = await response.json();

			if (response.ok && data.profile_photo_url) {
				setMessage("Photo successfully saved!");
				setPhotoPreview(data.profile_photo_url);
				setProfile((prev) => ({
					...prev,
					profile_photo_url: data.profile_photo_url,
				}));
			} else {
				console.error("Upload error:", data);
				setMessage(
					data.msg || "Upload failed. Check backend or storage rules."
				);
			}
		} catch (err) {
			console.error("Upload exception:", err);
			setMessage("Upload failed due to network or server error.");
		}
	};

	// --- Handle password update ---
	const handlePasswordUpdate = async (e) => {
		e.preventDefault();
		setMessage("Password change is simulated for security.");
		// Implement real API call if backend supports it
	};

	if (isLoading)
		return <div className="loading-page">Loading Profile...</div>;

	// --- Social Icon component ---
	const SocialIcon = ({ pathData, url }) => (
		<a
			href={url || "#"}
			className="social-icon"
			target="_blank"
			rel="noreferrer"
		>
			<svg viewBox="0 0 512 512">
				<path d={pathData}></path>
			</svg>
		</a>
	);

	return (
		<div className="profile-container-wrapper">
			<header className="page-header-nav">
				<div className="header-left">
					<Link to="/" className="back-link">
						← Back to Main
					</Link>
				</div>
				<div className="header-center">
					<h1>Account Settings</h1>
				</div>
				<div className="header-right" />
			</header>

			<div className="profile-card-centered">
				<div className="card">
					{/* Image Band */}
					<div className="imge">
						<div className="UserPhotoContainer">
							<img
								src={photoPreview}
								alt="User Profile"
								className="UserPhoto"
							/>
							<input
								type="file"
								id="profile-upload"
								accept="image/*"
								onChange={handlePhotoChange}
								style={{ display: "none" }}
							/>
							<label
								htmlFor="profile-upload"
								className="upload-label"
							>
								Change Photo
							</label>
						</div>
					</div>

					{/* Details */}
					<div className="profile-details-content">
						<p className="UserName">{profile.username || "N/A"}</p>
						<p className="UserStats">
							Total Reviews:{" "}
							<strong>{stats.total_ratings}</strong>
						</p>

						<div className="Description">
							<p>
								<strong>Email:</strong>{" "}
								{profile.email || "Not Available"}
							</p>
							<p>
								<strong>Status:</strong>{" "}
								{profile.is_admin
									? "Administrator"
									: "Standard User"}
							</p>
							<p>
								<strong>Verification:</strong>{" "}
								{profile.is_verified ? "Verified" : "Pending"}
							</p>
						</div>

						<div className="password-update-section">
							<h2 style={{ fontSize: "1.2rem" }}>
								Change Password
							</h2>
							<form onSubmit={handlePasswordUpdate}>
								<div className="form-group">
									<input
										className="input-field"
										type="password"
										placeholder="New Password"
										value={newPassword}
										onChange={(e) =>
											setNewPassword(e.target.value)
										}
										required
									/>
								</div>
								<button type="submit" className="submit-button">
									Update Password
								</button>
							</form>
							{message && (
								<p className="auth-message">{message}</p>
							)}
						</div>

						{/* Social Media */}
						<div className="social-media">
							<SocialIcon
								pathData="M459.37 151.716c..."
								url="https://twitter.com/"
							/>
							<SocialIcon
								pathData="M224.1 141c-63.6 0..."
								url="https://instagram.com/"
							/>
							<SocialIcon
								pathData="M504 256C504 119 393 8..."
								url="https://facebook.com/"
							/>
							<SocialIcon
								pathData="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5..."
								url="https://linkedin.com/"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default ProfilePage;
