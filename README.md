📚 The Next Read – Intelligent Book Recommendation System

The Next Read is a full-stack AI-powered book recommendation platform built using React, Flask, PostgreSQL, and Supabase Storage.
It offers personalized book suggestions using hybrid recommendation logic, secure user authentication, OTP verification, ratings, reviews, admin book management, and a smooth UI experience.

🚀 Features
👤 User Features

Register/Login using JWT Authentication

OTP-based Email Verification

Search & Filter Books

View Personalized Recommendations

Add Books to Cart

Rate & Review Books

Reset Password using OTP

Update Profile + Upload Profile Photo

🛠 Admin Features

Add New Books

Manage Dashboard

Moderate Reviews

🤖 AI / ML Features

Collaborative Filtering using pivot table & similarity matrix

Content-based fallback using author/genre

Hybrid recommendation pipeline

🏗 Tech Stack

Frontend: React.js, Tailwind/Custom CSS
Backend: Flask (Python), Flask-JWT, Flask-Migrate
Database: PostgreSQL (Supabase)
Authentication: JWT
Storage: Supabase Storage
Machine Learning: Pandas, NumPy, Pickle Models
Tools: Postman, JMeter (Performance Testing)
Version Control: GitHub

📁 Folder Structure
root/
│── backend/
│    ├── app.py
│    ├── requirements.txt
│    ├── migrations/
│    ├── pivot.pkl
│    ├── similarity_scores.pkl
│    └── ...
│
│── frontend/
│    ├── src/
│    ├── public/
│    ├── package.json
│    └── ...
│
└── README.md

⚙️ Backend Setup
1️⃣ Create Virtual Environment
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

2️⃣ Add .env File
DATABASE_URL=postgresql+psycopg2://xxxxxxxx
JWT_SECRET_KEY=your_secret
SUPABASE_URL=https://xyz.supabase.co
SUPABASE_KEY=service_role_or_anon_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

3️⃣ Run Migrations
flask db init   # only first time
flask db migrate -m "initial tables"
flask db upgrade

4️⃣ Start Backend
python app.py

🌐 Frontend Setup
cd frontend
npm install
npm start

🔌 API Endpoints Overview
Endpoint	Method	Description
/register	POST	User Registration
/login	POST	Login (JWT)
/send-verification-otp	POST	OTP Email
/verify-otp	POST	Verify OTP
/search	GET	Search + Filter
/rate	POST	Rate a Book
/recommend	GET	Recommendation System
/upload-profile-photo	POST	Profile Image Upload (Supabase)
/admin/add-book	POST	Admin Add Book
🖼 Screenshots
⭐ Main Home Page

⭐ Admin Panel

⭐ OTP Verification

(Replace the image paths with your GitHub image URLs)

🧩 System Architecture Diagrams
🔹 User Authentication Flow

🔹 Recommendation Engine Flow

🔹 Rating + OTP Verification Flow

🔹 Frontend → Backend → Database Flow

🔹 User Access Diagram

📊 Performance Testing (JMeter)

Load Testing Performed Using Apache JMeter:

Concurrent 50/100/200 users

Monitored API response time, throughput

Backend stable under load

Login + Search API optimized with indexes

🔮 Future Enhancements

AI-powered NLP Review Analysis

Voice-based book search

User reading history + personalized dashboard

Social sharing of book lists

In-app recommendation analytics

Auto-moderation for reviews

🏁 Conclusion

The Next Read successfully integrates AI, Web Technologies, and Cloud Infrastructure into a seamless recommendation platform.
Its hybrid ML engine, modern UI, strong security, and scalable backend make it a robust system ready for real-world deployment.
