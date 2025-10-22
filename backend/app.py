import pickle
import os
import random
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, JWTManager, get_jwt_identity
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from sqlalchemy import func
from functools import wraps
from dotenv import load_dotenv
import re # New: Import th regex module
from datetime import datetime
from werkzeug.utils import secure_filename
import time
from supabase import create_client, Client # <-- NEW IMPORT

load_dotenv()
import os
from dotenv import load_dotenv

load_dotenv()

# --- 1. App Initialization & Configuration ---
app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config["JWT_SECRET_KEY"] = os.getenv('JWT_SECRET_KEY')

# Initialize Supabase Client for Storage
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# --- 2. Initialize Extensions ---
db = SQLAlchemy(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)

# --- 3. Load ML Model Files ---
pivot_table = pickle.load(open('pivot.pkl', 'rb'))
similarity_scores = pickle.load(open('similarity_scores.pkl', 'rb'))

# --- 4. In-Memory OTP Storage ---
otp_storage = {}

# --- 5. Database Models ---
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    is_verified = db.Column(db.Boolean, default=False, nullable=False)
    is_admin = db.Column(db.Boolean, default=False, nullable=False)
    ratings = db.relationship('Rating', backref='user', lazy=True, cascade="all, delete-orphan")
    profile_photo_url = db.Column(db.Text, default='https://via.placeholder.com/150/444/999?text=U') 
    reviews = db.relationship('Review', backref='user', lazy='dynamic') # Tracks all reviews by this user

class Rating(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    book_title = db.Column(db.Text, nullable=False)
    rating = db.Column(db.Integer, nullable=False)

class Review(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    book_title = db.Column(db.Text, nullable=False)
    description_text = db.Column(db.Text, nullable=False) # The user's detailed description
    is_approved = db.Column(db.Boolean, default=False, nullable=False) # <-- MODERATION FLAG
    timestamp = db.Column(db.DateTime, default=datetime.utcnow) # For sorting/display
class Book(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    isbn = db.Column(db.String(40), unique=True, nullable=False)
    title = db.Column(db.Text, nullable=False)
    author = db.Column(db.Text)
    year = db.Column(db.String(20))
    publisher = db.Column(db.Text)
    image_url_m = db.Column(db.Text)
    genre = db.Column(db.String(100))
    price = db.Column(db.Float)

otp_storage = {}
# --- 6. Custom Decorators & Helper Functions ---
def admin_required():
    def wrapper(fn):
        @wraps(fn)
        @jwt_required()
        def decorator(*args, **kwargs):
            current_user_username = get_jwt_identity()
            user = User.query.filter_by(username=current_user_username).first()
            if not user or not user.is_admin:
                return jsonify(msg="Admins only! Access denied."), 403
            return fn(*args, **kwargs)
        return decorator
    return wrapper

def recommend(book_isbn):
    clean_isbn = str(book_isbn).strip()
    try:
        index = pivot_table.index.get_loc(clean_isbn)
        similar_items = sorted(list(enumerate(similarity_scores[index])), key=lambda x: x[1], reverse=True)[1:6]
        recommendations = []
        for i in similar_items:
            recommended_isbn = str(pivot_table.index[i[0]]).strip()
            book_info = Book.query.filter_by(isbn=recommended_isbn).first()
            if book_info:
                recommendations.append({"title": book_info.title, "author": book_info.author, "image": book_info.image_url_m.replace("http://", "https://") if book_info.image_url_m else "", "genre": book_info.genre, "price": book_info.price, "isbn": book_info.isbn})
        return recommendations
    except KeyError:
        book = Book.query.filter_by(isbn=clean_isbn).first()
        if not book: return []
        recs = Book.query.filter(Book.author == book.author, Book.isbn != book.isbn).limit(5).all()
        if len(recs) < 5:
            existing_titles = [r.title for r in recs] + [book.title]
            needed = 5 - len(recs)
            genre_recs = Book.query.filter(Book.genre == book.genre, ~Book.title.in_(existing_titles)).limit(needed).all()
            recs.extend(genre_recs)
        return [{"title": b.title, "author": b.author, "image": b.image_url_m.replace("http://", "https://") if b.image_url_m else "", "genre": b.genre, "price": b.price, "isbn": b.isbn} for b in recs]

PASSWORD_REGEX = re.compile(r"^(?=.*[0-9])(?=.*[^A-Za-z0-9]).{6,}$")

# --- 7. API Endpoints ---
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username, password, email = data.get('username'), data.get('password'), data.get('email')
    
    if not all([username, password, email]): return jsonify({"msg": "Username, password, and email are required"}), 400
    
    # NEW: Server-side validation of password requirements
    if not PASSWORD_REGEX.match(password):
        return jsonify({"msg": "Password must be at least 6 characters, contain 1 digit, and 1 special character."}), 400
    
    if User.query.filter_by(username=username).first() or User.query.filter_by(email=email).first(): return jsonify({"msg": "Username or email already exists"}), 400
    
    new_user = User(username=username, email=email, password_hash=generate_password_hash(password))
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"msg": "User created successfully"}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username, password = data.get('username'), data.get('password')
    user = User.query.filter_by(username=username).first()
    if user and check_password_hash(user.password_hash, password):
        access_token = create_access_token(identity=username)
        return jsonify(access_token=access_token)
    return jsonify({"msg": "Bad username or password"}), 401


@app.route('/search', methods=['GET'])
@jwt_required(optional=True)
def search_books():
    current_user_username = get_jwt_identity()
    user_ratings_map = {}
    if current_user_username:
        user = User.query.filter_by(username=current_user_username).first()
        if user:
            user_ratings = Rating.query.filter_by(user_id=user.id).all()
            user_ratings_map = {r.book_title: r.rating for r in user_ratings}
    search_term = request.args.get('q', '').lower()
    genre = request.args.get('genre', 'all')
    max_price = float(request.args.get('price', '40'))
    query = db.session.query(Book, func.avg(Rating.rating).label('average_rating'), func.count(Rating.rating).label('rating_count')).outerjoin(Rating, Book.title == Rating.book_title).group_by(Book.id)
    if search_term: query = query.filter(Book.title.ilike(f'%{search_term}%'))
    if genre != 'all': query = query.filter(Book.genre == genre)
    query = query.filter(Book.price <= max_price)
    filtered_books = query.limit(100).all()
    results = [{"title": b.title, "author": b.author, "image": b.image_url_m.replace("http://", "https://") if b.image_url_m else "", "genre": b.genre, "price": b.price, "isbn": b.isbn, "average_rating": round(avg, 1) if avg else 0, "rating_count": count, "user_rating": user_ratings_map.get(b.title, 0)} for b, avg, count in filtered_books]
    return jsonify(results)
# In backend/app.py, replace the entire upload_profile_photo function

@app.route('/upload-profile-photo', methods=['POST'])
@jwt_required()
def upload_profile_photo():
    current_user_username = get_jwt_identity()
    user = User.query.filter_by(username=current_user_username).first()

    # CRITICAL: We look for the file under the key 'file' from the frontend FormData
    if 'file' not in request.files:
        return jsonify(msg="No file part in the request."), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify(msg="No selected file."), 400
    
    if file:
        # Generate a unique filename (e.g., user_123_timestamp.jpg)
        filename = secure_filename(f"user_{user.id}_{int(time.time())}.{file.filename.rsplit('.', 1)[1].lower()}")
        bucket_name = "Profile Photo" # Your specified bucket name
        file_path = f"{user.username}/{filename}" # Path within the bucket

        try:
            # 1. Read file data into memory
            file_data = file.read()
            
            # 2. Upload to Supabase Storage
            supabase.storage.from_(bucket_name).upload(
                file=file_data, 
                path=file_path,
                file_options={"content-type": file.mimetype} 
            )
            
            # 3. Get the public URL
            # The URL is constructed using the base project URL and the path
            public_url = f"{SUPABASE_URL}/storage/v1/object/public/{bucket_name}/{file_path}"

            # 4. Save the permanent public URL to the database
            user.profile_photo_url = public_url
            db.session.commit()

            return jsonify(msg="Photo updated and saved successfully.", profile_photo_url=public_url), 200

        except Exception as e:
            print(f"SUPABASE UPLOAD FAILED: {e}")
            return jsonify(msg=f"Failed to upload to cloud storage. Check policies."), 500

        # 2. Get the public URL for the image
        # Assuming your bucket policy allows public access for reading.
        # This URL is what is saved in the database.
        
        # --- IMPORTANT: Get the public URL based on Supabase Project URL ---
        public_url = f"{SUPABASE_URL}/storage/v1/object/public/{bucket_name}/{file_path}"
        
        # 3. Update the database with the new permanent URL
        user.profile_photo_url = public_url
        db.session.commit()

        return jsonify(msg="Photo updated successfully.", profile_photo_url=public_url), 200

@app.route('/rate', methods=['POST'])
@jwt_required()
def rate_book():
    current_user_username = get_jwt_identity()
    user = User.query.filter_by(username=current_user_username).first()
    if not user.is_verified: return jsonify(msg="Email not verified. Please verify your email to rate books."), 403
    data = request.get_json()
    book_title, rating = data.get('title'), data.get('rating')
    existing_rating = Rating.query.filter_by(user_id=user.id, book_title=book_title).first()
    if existing_rating: existing_rating.rating = rating
    else: db.session.add(Rating(user_id=user.id, book_title=book_title, rating=rating))
    db.session.commit()
    return jsonify({"msg": f"Successfully rated '{book_title}' with {rating}"})

@app.route('/my-ratings', methods=['GET'])
@jwt_required()
def get_my_ratings():
    current_user_username = get_jwt_identity()
    user = User.query.filter_by(username=current_user_username).first()
    user_ratings = Rating.query.filter_by(user_id=user.id).all()
    rated_books_details = []
    for r in user_ratings:
        book_info = Book.query.filter_by(title=r.book_title).first()
        if book_info: rated_books_details.append({"title": r.book_title, "author": book_info.author, "image": book_info.image_url_m.replace("http://", "https://") if book_info.image_url_m else "", "isbn": book_info.isbn, "user_rating": r.rating})
    return jsonify(rated_books_details)
@app.route('/submit-review', methods=['POST'])
@jwt_required()
def submit_review():
    current_user_username = get_jwt_identity()
    user = User.query.filter_by(username=current_user_username).first()
    data = request.get_json()
    title, description = data.get('title'), data.get('description')

    if not title or not description:
        return jsonify(msg="Book title and review description are required."), 400

    # Create new review record with approval flag set to FALSE
    new_review = Review(
        user_id=user.id,
        book_title=title,
        description_text=description,
        is_approved=False
    )
    db.session.add(new_review)
    db.session.commit()
    return jsonify(msg="Review submitted for admin approval."), 200

@app.route('/reviews/<string:book_title>', methods=['GET'])
def get_approved_reviews(book_title):
    # This endpoint fetches reviews that have been approved by an admin
    approved_reviews = Review.query.filter(
        Review.book_title == book_title,
        Review.is_approved == True
    ).all()
    
    # We must also fetch the username of the person who wrote the review
    results = []
    for review in approved_reviews:
        results.append({
            'username': review.user.username,
            'description': review.description_text,
            'timestamp': review.timestamp.isoformat()
        })
        
    return jsonify(results)
@app.route('/user-stats', methods=['GET'])
@jwt_required()
def get_user_stats():
    current_user_username = get_jwt_identity()
    user = User.query.filter_by(username=current_user_username).first()

    if not user:
        return jsonify(msg="User not found."), 404

    # --- CORRECTED: Query the Rating table for the count ---
    total_reviews = Rating.query.filter_by(user_id=user.id).count() 
    
    # We can also simplify the name since it's the count of ratings
    total_ratings_count = total_reviews # Renaming for clarity in the response
    
    total_books_renewed = 0 
    
    return jsonify({
        # Ensure key names match what the frontend expects
        'total_ratings': total_ratings_count, 
        'total_books_renewed': total_books_renewed
    }), 200
    
# You must also update the /profile endpoint to return the new URL:
@app.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    current_user_username = get_jwt_identity()
    user = User.query.filter_by(username=current_user_username).first()
    if not user: 
        return jsonify(msg="User not found"), 404
    # Include 'email' in the response
    return jsonify(
        username=user.username, 
        email=user.email,  # Add this line
        is_admin=user.is_admin, 
        is_verified=user.is_verified, 
        profile_photo_url=user.profile_photo_url
    )

@app.route('/recommend', methods=['GET'])
def get_recommendations():
    book_isbn = request.args.get('isbn')
    if book_isbn: return jsonify(recommend(book_isbn))
    else: return jsonify({"error": "Book ISBN is required"}), 400

@app.route('/admin/add-book', methods=['POST'])
@admin_required()
def add_book():
    data = request.get_json()
    if not all(k in data for k in ['isbn', 'title', 'author']): return jsonify(msg="Missing required book fields"), 400
    if Book.query.filter_by(isbn=data['isbn']).first(): return jsonify(msg="Book with this ISBN already exists"), 400
    new_book = Book(isbn=data['isbn'], title=data['title'], author=data['author'], year=data.get('year'), publisher=data.get('publisher'), image_url_m=data.get('image_url_m'), genre=data.get('genre'), price=data.get('price'))
    db.session.add(new_book)
    db.session.commit()
    return jsonify(msg="Book added successfully"), 201

@app.route('/send-verification-otp', methods=['POST'])
@jwt_required()
def send_verification_otp():
    current_user_username = get_jwt_identity()
    user = User.query.filter_by(username=current_user_username).first()
    if not user: return jsonify(msg="User not found"), 404
    if user.is_verified: return jsonify(msg="User is already verified"), 400
    otp = str(random.randint(100000, 999999))
    otp_storage[user.username] = otp
    sender_email, sender_password = os.getenv("EMAIL_USER"), os.getenv("EMAIL_PASS")
    message = MIMEMultipart("alternative")
    message["Subject"], message["From"], message["To"] = "Your Book Recommender Verification Code", sender_email, user.email
    html = f"<html><body><p>Your verification code is: <b>{otp}</b></p></body></html>"
    message.attach(MIMEText(html, "html"))
    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, user.email, message.as_string())
        return jsonify(msg="OTP sent successfully"), 200
    except Exception as e:
        return jsonify(msg=f"Failed to send OTP: {e}"), 500

@app.route('/verify-otp', methods=['POST'])
@jwt_required()
def verify_otp():
    current_user_username = get_jwt_identity()
    user = User.query.filter_by(username=current_user_username).first()
    otp_from_user = request.get_json().get('otp')
    if user.username in otp_storage and otp_storage[user.username] == otp_from_user:
        user.is_verified = True
        db.session.commit()
        del otp_storage[user.username]
        return jsonify(msg="Email verified successfully!"), 200
    return jsonify(msg="Invalid or expired OTP"), 400

@app.route('/forgot-password', methods=['POST'])
def forgot_password():
    email = request.get_json().get('email')
    user = User.query.filter_by(email=email).first()

    if not user:
        # Still send a success message to not reveal which emails are registered
        return jsonify(msg="If this email is registered, a recovery OTP has been sent."), 200

    otp = str(random.randint(100000, 999999))
    # Store OTP with a key that includes email to distinguish from verification OTPs
    otp_storage[f"reset_{user.username}"] = otp

    # --- Email Sending Logic ---
    sender_email = os.getenv("EMAIL_USER")
    sender_password = os.getenv("EMAIL_PASS")
    
    message = MIMEMultipart("alternative")
    message["Subject"] = "Your Password Reset Code"
    message["From"] = sender_email
    message["To"] = user.email
    html = f"<html><body><p>Your password reset code is: <b>{otp}</b></p></body></html>"
    message.attach(MIMEText(html, "html"))

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, user.email, message.as_string())
        return jsonify(msg="If this email is registered, a recovery OTP has been sent."), 200
    except Exception as e:
        print(f"Email sending failed: {e}")
        return jsonify(msg="Failed to send OTP."), 500


@app.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    email = data.get('email')
    otp = data.get('otp')
    new_password = data.get('new_password')

    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify(msg="Invalid request."), 400
    
    if not PASSWORD_REGEX.match(new_password):
        return jsonify({"msg": "New password must be at least 6 characters, contain 1 digit, and 1 special character."}), 400

    # NEW: Password History Check (Is the new password the same as the old one?)
    if check_password_hash(user.password_hash, new_password):
        return jsonify(msg="The new password cannot be the same as your current password."), 400
    # Check if the OTP is correct
    if f"reset_{user.username}" in otp_storage and otp_storage[f"reset_{user.username}"] == otp:
        user.password_hash = generate_password_hash(new_password)
        db.session.commit()
        del otp_storage[f"reset_{user.username}"] # Clean up OTP
        return jsonify(msg="Password updated successfully. Please log in."), 200
    
    return jsonify(msg="Invalid or expired OTP."), 400
@app.route('/update-password', methods=['POST'])
@jwt_required()
def update_password():
    current_user_username = get_jwt_identity()
    user = User.query.filter_by(username=current_user_username).first()
    data = request.get_json()
    new_password = data.get('new_password')
    
    # Check for password complexity (using the same regex)
    if not PASSWORD_REGEX.match(new_password):
        return jsonify({"msg": "Password must be at least 6 characters, contain 1 digit, and 1 special character."}), 400

    # Password History Check (Cannot be the same as the current password)
    if check_password_hash(user.password_hash, new_password):
        return jsonify(msg="The new password cannot be the same as your current password."), 400

    # Update and commit the new password hash
    user.password_hash = generate_password_hash(new_password)
    db.session.commit()
    
    return jsonify(msg="Password updated successfully. Please log in again."), 200
# --- 8. Main Block ---
if __name__ == '__main__':
    app.run(debug=True)