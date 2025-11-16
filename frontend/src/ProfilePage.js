import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import VerificationModal from "./VerificationModal";

const EMPTY_PROFILE = {
	username: "Loading...",
	email: "Loading...",
	is_verified: false,
	is_admin: false,
	profile_photo_url: "/user.png", // ✅ Corrected default path
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
	const [progress, setProgress] = useState(0);
	const [showVerifyModal, setShowVerifyModal] = useState(false); // ✅ Correct placement

	const API_URL = "http://127.0.0.1:5000";

	// === Fetch Profile + Stats ===
	const fetchUserData = useCallback(async () => {
		try {
			const [profileRes, statsRes] = await Promise.all([
				fetch(`${API_URL}/profile`, {
					headers: { Authorization: `Bearer ${token}` },
				}).then((r) => r.json()),
				fetch(`${API_URL}/user-stats`, {
					headers: { Authorization: `Bearer ${token}` },
				}).then((r) => r.json()),
			]);
			setProfile(profileRes);
			setStats(statsRes);
			setPhotoPreview(profileRes.profile_photo_url || "/user.png");
			setIsLoading(false);
		} catch (err) {
			console.error("Profile fetch failed:", err);
			setIsLoading(false);
		}
	}, [token]);

	useEffect(() => {
		fetchUserData();
	}, [fetchUserData]);

	// === Handle Profile Photo Upload ===
	const handlePhotoChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setPhotoPreview(URL.createObjectURL(file));
			uploadPhoto(file);
		}
	};

	const uploadPhoto = async (file) => {
		setMessage("Uploading...");
		const formData = new FormData();
		formData.append("file", file);

		try {
			const res = await axios.post(
				`${API_URL}/upload-profile-photo`,
				formData,
				{
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "multipart/form-data",
					},
					onUploadProgress: (e) => {
						setProgress(Math.round((e.loaded * 100) / e.total));
					},
				}
			);

			if (res.data.profile_photo_url) {
				setProfile((prev) => ({
					...prev,
					profile_photo_url: res.data.profile_photo_url,
				}));
				setMessage("Profile photo updated successfully!");
				setProgress(0);
			}
		} catch (err) {
			console.error(err);
			setMessage("Upload failed. Check Supabase permissions.");
			setProgress(0);
		}
	};

	if (isLoading)
		return <div className="loading-page">Loading Profile...</div>;

	return (
		<div className="profile-page-wrapper">
			<header className="profile-header">
				<Link to="/" className="back-btn">
					← Back
				</Link>
				<h1>Account Overview</h1>
			</header>

			<motion.div
				className="profile-card-upgraded"
				initial={{ opacity: 0, y: 30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
			>
				{/* === Profile Photo Section === */}
				<div className="profile-photo-section">
					<div className="photo-wrapper">
						<img
							src={photoPreview}
							alt="Profile"
							className="profile-photo"
						/>
						<label
							htmlFor="profile-upload"
							className="upload-label"
						>
							Change Photo
						</label>
						<input
							type="file"
							id="profile-upload"
							accept="image/*"
							onChange={handlePhotoChange}
							style={{ display: "none" }}
						/>
					</div>
					{progress > 0 && (
						<div className="upload-progress-bar">
							<div
								className="upload-progress"
								style={{ width: `${progress}%` }}
							></div>
						</div>
					)}
					{message && <p className="upload-status">{message}</p>}
				</div>

				{/* === User Info Section === */}
				<div className="profile-info">
					<h2>{profile.username}</h2>
					<p className="profile-email">{profile.email}</p>
					<div className="status-tags">
						<span
							className={`status-badge ${
								profile.is_verified ? "verified" : "pending"
							}`}
						>
							{profile.is_verified ? "Verified" : "Pending"}
						</span>
						<span
							className={`role-badge ${
								profile.is_admin ? "admin" : "user"
							}`}
						>
							{profile.is_admin ? "Admin" : "User"}
						</span>
					</div>

					<p>
						Total Reviews: <strong>{stats.total_ratings}</strong>
					</p>

					{/* === Verify Email Button === */}
					{!profile.is_verified && (
						<button
							className="verify-email-button"
							onClick={() => setShowVerifyModal(true)}
						>
							Verify Email
						</button>
					)}
				</div>

				{/* === Password Section === */}
				<div className="password-card">
					<h3>Change Password</h3>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							setMessage("Password update simulated.");
						}}
					>
						<input
							type="password"
							className="password-input"
							placeholder="Enter new password"
							value={newPassword}
							onChange={(e) => setNewPassword(e.target.value)}
						/>
						<button type="submit" className="password-btn">
							Update
						</button>
					</form>
				</div>
			</motion.div>

			{/* === Verification Modal === */}
			{showVerifyModal && (
				<VerificationModal
					token={token}
					onVerified={() =>
						setProfile({ ...profile, is_verified: true })
					}
					onClose={() => setShowVerifyModal(false)}
				/>
			)}
		</div>
	);
}

export default ProfilePage;
