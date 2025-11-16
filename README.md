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

<img width="947" height="1454" alt="image" src="https://github.com/user-attachments/assets/6ac3184c-6585-4f9e-ad6e-0b99c1f6dfcd" />
<img width="947" height="1454" alt="image" src="https://github.com/user-attachments/assets/65fa988a-1d8e-47a3-9448-23d82d7731d9" />
<img width="947" height="1454" alt="image" src="https://github.com/user-attachments/assets/d0ead24a-4d7d-4156-89ae-3221dde5593a" />
<img width="947" height="1454" alt="image" src="https://github.com/user-attachments/assets/ea2143f6-f0ec-427c-8e5d-b478efcbb88d" />
<img width="947" height="1454" alt="image" src="https://github.com/user-attachments/assets/16e60f2e-2c26-48dd-bee5-342d2aa65045" />
<img width="947" height="1454" alt="image" src="https://github.com/user-attachments/assets/0e289d6a-38b3-4bac-b16d-074ae7c64e40" />
<img width="947" height="1454" alt="image" src="https://github.com/user-attachments/assets/1f1aa6e1-f5dc-4745-9830-1a9b6a7de2a6" />


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
