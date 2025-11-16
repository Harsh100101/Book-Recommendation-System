# 📚 Next Read – AI-Powered Book Recommendation System

> *“The only way to do great work is to love what you do.” – Steve Jobs*

Next Read is an **AI-powered book recommendation platform** that helps users discover books based on their interests, ratings, and reading preferences. Built using **React.js (Frontend)**, **Flask (Backend)**, and **PostgreSQL (Database)**, the system provides personalized suggestions using a **hybrid recommendation model** combining content-based and collaborative filtering.

---

## 🚀 Features

* 🔍 Smart AI-based book recommendations
* 🔐 Secure JWT authentication & OTP email verification
* 📸 Profile photo upload using Supabase Storage
* ⭐ User ratings, reviews, and dashboard statistics
* 🎨 Modern, responsive UI built with React.js
* 🛠️ Admin panel for moderation and book management

---

## 🏗️ Tech Stack

**Frontend:** React.js, Tailwind CSS, Axios
**Backend:** Flask, SQLAlchemy, Flask-JWT-Extended, Flask-Migrate
**Database:** PostgreSQL (Supabase)
**ML Model:** Scikit-learn, Pandas, Cosine Similarity
**Tools:** GitHub, Postman, JMeter, Render/Railway

---

## ⚙️ Installation

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
flask db upgrade
flask run
```

### Frontend

```bash
cd frontend
npm install
npm start
```

---

## 📂 Folder Structure

```
next-read/
├── backend/
│   ├── app.py
│   ├── models/
│   ├── migrations/
│   ├── tests/
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
└── README.md
```

---

## 🧪 Testing

* PyTest for backend API endpoints
* JMeter for performance/load testing
* Validation tests for login, registration, and recommendations

---

## 💡 Future Enhancements

* Mobile app (React Native)
* NLP-based advanced chatbot
* Integration with Google Books/Goodreads APIs
* Multi-language UI support
* Personalized reading analytics

---

## 👨‍💻 Contributors

**Harsh Sorathiya – 2303031247016**
**Manthan Shah – 2303031247028**
**Dhruv Shah – 2303031247078**
**Ovesh Khatri – 2303031247067**

**Project Guide:** *Asst. Professor Rahul Kumar Moud*
Department of AI & DS, Parul University, Vadodara

---

## 📚 References

* Scikit-learn Documentation
* Flask SQLAlchemy Docs
* React Official Docs
* Supabase Documentation
* Book Recommendation Dataset (Kaggle)

---

## 🏁 Conclusion

Next Read demonstrates how AI and modern web technologies can work together to deliver personalized book recommendations. This project successfully meets its objectives by integrating **machine learning**, **secure backend systems**, and a **user-friendly frontend interface**.
