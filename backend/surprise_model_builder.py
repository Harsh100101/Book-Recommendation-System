import pandas as pd
from surprise import Reader, Dataset, SVD
from surprise.dump import dump
import os

print("Starting model building process...")

# --- Load and Prepare Data ---
print("Loading data...")
# Load the datasets
books = pd.read_csv('Books.csv', low_memory=False)
ratings = pd.read_csv('Ratings.csv')

# Merge them
df = ratings.merge(books, on='ISBN')

# Filter for popular books (>= 50 ratings)
ratings_count = df.groupby('Book-Title').count()['Book-Rating'].reset_index()
ratings_count.rename(columns={'Book-Rating': 'num_ratings'}, inplace=True)
popular_books = ratings_count[ratings_count['num_ratings'] >= 50]['Book-Title']
popular_df = df[df['Book-Title'].isin(popular_books)]

# Filter for active users (>= 200 ratings)
user_ratings_count = popular_df.groupby('User-ID').count()['Book-Rating'].reset_index()
user_ratings_count.rename(columns={'Book-Rating': 'num_user_ratings'}, inplace=True)
active_users = user_ratings_count[user_ratings_count['num_user_ratings'] >= 200]['User-ID']
final_df = popular_df[popular_df['User-ID'].isin(active_users)]

# Prepare the data for the Surprise library
# The reader needs to know the scale of the ratings
reader = Reader(rating_scale=(1, 10))
data = Dataset.load_from_df(final_df[['User-ID', 'Book-Title', 'Book-Rating']], reader)

# --- Train the SVD Model ---
print("Training the SVD model... (This may take a few minutes)")
# Use the SVD algorithm (a form of Matrix Factorization)
svd = SVD(n_factors=100, n_epochs=20, random_state=42)

# Build the full training set from the data
trainset = data.build_full_trainset()

# Train the model
svd.fit(trainset)
print("Model training complete.")

# --- Save the Model ---
# We also need to save the final filtered dataframe for later use
final_df.to_pickle('final_df.pkl')

# Save the trained model
model_filename = 'svd_model.pkl'
print(f"Saving the trained model to {model_filename}...")
dump(model_filename, algo=svd)

print("Process finished successfully.")