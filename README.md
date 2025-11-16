# 📚 The Next Read – Intelligent Book Recommendation System

**The Next Read** is a full-stack **AI-powered book recommendation platform** built using **React, Flask, PostgreSQL, and Supabase Storage**. It provides personalized book suggestions through a hybrid recommendation engine, secure authentication, OTP verification, rating and review features, and a clean user experience.

---

## 🚀 Features

### 👤 User Features

* Register/Login using JWT Authentication
* OTP-based Email Verification
* Search & Filter Books
* View Personalized Recommendations
* Add Books to Cart
* Rate & Review Books
* Reset Password using OTP
* Update Profile + Upload Profile Photo

### 🛠 Admin Features

* Add New Books
* Manage Dashboard
* Moderate Reviews

### 🤖 AI / ML Features

* Collaborative Filtering using pivot table & similarity matrix
* Content-based fallback using author/genre
* Hybrid recommendation pipeline

---

## 🏗 Tech Stack

* **Frontend:** React.js, Tailwind/Custom CSS
* **Backend:** Flask (Python), Flask-JWT, Flask-Migrate
* **Database:** PostgreSQL (Supabase)
* **Authentication:** JWT
* **Storage:** Supabase Storage
* **Machine Learning:** Pandas, NumPy, Pickle Models
* **Tools:** Postman, JMeter
* **Version Control:** GitHub

---

## 📁 Folder Structure

```
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
```

---

## ⚙️ Backend Setup

### 1️⃣ Create Virtual Environment

```
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### 2️⃣ Add .env File

```
DATABASE_URL=postgresql+psycopg2://xxxxxxxx
JWT_SECRET_KEY=your_secret
SUPABASE_URL=https://xyz.supabase.co
SUPABASE_KEY=service_role_or_anon_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### 3️⃣ Run Migrations

```
flask db init
flask db migrate -m "initial tables"
flask db upgrade
```

### 4️⃣ Start Backend

```
python app.py
```

---

## 🌐 Frontend Setup

```
cd frontend
npm install
npm start
```

---

## 🔌 API Endpoints Overview

| Endpoint                 | Method | Description                             |
| ------------------------ | ------ | --------------------------------------- |
| `/register`              | POST   | User Registration                       |
| `/login`                 | POST   | Login using JWT                         |
| `/send-verification-otp` | POST   | Send OTP to email                       |
| `/verify-otp`            | POST   | Verify OTP                              |
| `/search`                | GET    | Search + Filter Books                   |
| `/rate`                  | POST   | Rate a Book                             |
| `/recommend`             | GET    | Recommendation System                   |
| `/upload-profile-photo`  | POST   | Upload profile photo (Supabase Storage) |
| `/admin/add-book`        | POST   | Add new book (Admin only)               |

---

## 🖼 Screenshots

### ⭐ Main Home Page

<img width="1903" height="987" alt="Screenshot 2025-11-05 144316" src="https://github.com/user-attachments/assets/5b134940-f09a-4444-8090-38cf45fc1a7e" />

### ⭐ Admin Panel

<img width="1282" height="717" alt="Screenshot 2025-11-05 145431" src="https://github.com/user-attachments/assets/5e4715fc-26a1-486e-aa65-996a2f9eddc5" />

### ⭐ OTP Verification

<img width="804" height="532" alt="Screenshot 2025-11-05 151605" src="https://github.com/user-attachments/assets/6eca0a36-2816-41b2-9bd5-5fdebc01c948" />

---

## 🧩 System Architecture Diagrams

* User Authentication Flow
* Recommendation Engine Flow
* Rating + OTP Verification Flow
* Frontend → Backend → Database Flow
* User Access Diagram
<img width="816" height="939" alt="image" src="https://github.com/user-attachments/assets/177b8c41-aa89-45d0-b007-1222fffea792" />
<img width="947" height="1454" alt="image" src="https://github.com/user-attachments/assets/9c45998b-5a22-4d5b-9d72-f2703af94506" />
<img width="940" height="768" alt="image" src="https://github.com/user-attachments/assets/71386f2f-dd1b-4296-af7a-b53f316140a8" />
<img width="940" height="802" alt="image" src="https://github.com/user-attachments/assets/e37a907c-0695-4fb7-a9a9-50e15b7e5015" />
<img width="940" height="684" alt="image" src="https://github.com/user-attachments/assets/a3898aba-283e-48ef-8818-8c4c7906a25f" />
<img width="940" height="662" alt="image" src="https://github.com/user-attachments/assets/73460ac2-b1c4-4dfc-a1ad-bc3f3a772489" />
<img width="870" height="684" alt="image" src="https://github.com/user-attachments/assets/da18ced1-dfeb-4736-829a-173792eb1581" />

---

## 📊 Performance Testing (JMeter)

Load testing performed using Apache JMeter:

* Concurrent 50/100/200 users
* Monitored API response time & throughput
* Backend remained stable under load
* Optimized search & login queries with DB indexing

---

## 🔮 Future Enhancements

* AI-powered NLP Review Analysis
* Voice-based book search
* Personalized reading dashboard
* Social sharing of book lists
* In-app recommendation analytics
* Automated review moderation

---

## 🏁 Conclusion

**The Next Read** integrates AI, modern web technologies, and cloud architecture to deliver a personalized and scalable book recommendation experience. Its hybrid ML engine, secure backend, and user-friendly frontend make it a robust platform ready for deployment.

---
