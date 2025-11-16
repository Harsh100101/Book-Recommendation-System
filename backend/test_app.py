import pytest
from app import app, db, User
import json
from werkzeug.security import generate_password_hash

# Pytest fixture to set up a test client and in-memory database
@pytest.fixture(scope='module')
def test_client():
    # Configure the app for testing
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:' # Use an in-memory SQLite DB
    
    with app.app_context():
        # Create all database tables
        db.create_all()
        
        # --- Create a test admin user for login tests ---
        test_admin = User(
            username='test_admin',
            email='admin@test.com',
            password_hash=generate_password_hash('Admin@123'),
            is_admin=True,
            is_verified=True
        )
        db.session.add(test_admin)
        
        # --- Create a test regular user for testing ---
        test_user = User(
            username='test_user',
            email='user@test.com',
            password_hash=generate_password_hash('User@123'),
            is_admin=False,
            is_verified=False
        )
        db.session.add(test_user)
        
        db.session.commit()

        # Create a test client using the app context
        testing_client = app.test_client()
        
        # 'yield' the client to the test functions
        yield testing_client
        
        # Teardown: close and drop the in-memory database
        db.session.close()
        db.drop_all()

# --- Test Cases ---

def test_search_endpoint(test_client):
    """Test 1: GIVEN a Flask app, WHEN the '/search' endpoint is requested (GET), THEN check for a 200 OK response."""
    response = test_client.get('/search?q=&genre=all&price=40')
    assert response.status_code == 200
    json_data = response.get_json()
    assert isinstance(json_data, list)
    assert response.status_code == 200

def test_user_registration(test_client):
    """Test 2: GIVEN a new user's details, WHEN the '/register' endpoint is hit (POST), THEN check for 201 Created."""
    new_user = {
        "username": "new_user_99",
        "email": "new99@test.com",
        "password": "Password@99"
    }
    response = test_client.post('/register', data=json.dumps(new_user), content_type='application/json')
    assert response.status_code == 201
    assert b"User created successfully" in response.data

def test_user_login_and_token(test_client):
    """Test 3: GIVEN an existing user, WHEN the '/login' endpoint is hit (POST), THEN check for 200 OK and a JWT token."""
    login_credentials = {
        "username": "test_admin",
        "password": "Admin@123"
    }
    response = test_client.post('/login', data=json.dumps(login_credentials), content_type='application/json')
    assert response.status_code == 200
    response_json = json.loads(response.data)
    assert 'access_token' in response_json

def test_protected_route_no_token(test_client):
    """Test 4: GIVEN a protected endpoint, WHEN it is accessed without a token, THEN check for a 401 Unauthorized response."""
    response = test_client.get('/profile')
    assert response.status_code == 401

def test_protected_route_with_token(test_client):
    """Test 5: GIVEN a protected endpoint, WHEN it is accessed with a valid token, THEN check for a 200 OK response."""
    # First, get a token
    login_credentials = {"username": "test_admin", "password": "Admin@123"}
    login_response = test_client.post('/login', data=json.dumps(login_credentials), content_type='application/json')
    token = json.loads(login_response.data)['access_token']
    
    # Now, use the token to access the protected route
    headers = {'Authorization': f'Bearer {token}'}
    response = test_client.get('/profile', headers=headers)
    assert response.status_code == 200
    assert b"test_admin" in response.data # Check if the profile data is correct
    assert b"is_admin" in response.data

def test_admin_route_as_regular_user(test_client):
    """Test 6: GIVEN an admin endpoint, WHEN accessed by a non-admin user, THEN check for a 403 Forbidden response."""
    # Get a non-admin token
    login_credentials = {"username": "test_user", "password": "User@123"}
    login_response = test_client.post('/login', data=json.dumps(login_credentials), content_type='application/json')
    token = json.loads(login_response.data)['access_token']
    
    headers = {'Authorization': f'Bearer {token}'}
    
    # Try to add a book (an admin-only action)
    new_book = {"isbn": "123456", "title": "Test Book", "author": "Test Author"}
    response = test_client.post('/admin/add-book', data=json.dumps(new_book), content_type='application/json', headers=headers)
    
    assert response.status_code == 403
    assert b"Admins only" in response.data