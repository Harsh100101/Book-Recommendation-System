import pandas as pd
import numpy as np

# Load the datasets
books = pd.read_csv('Books.csv', low_memory=False)
ratings = pd.read_csv('Ratings.csv')

# Merge the two dataframes on the 'ISBN' column
df = ratings.merge(books, on='ISBN')

# --- Start of New Code ---

# 1. Filter by number of ratings per book
# First, count how many ratings each book has
ratings_count = df.groupby('Book-Title').count()['Book-Rating'].reset_index()
ratings_count.rename(columns={'Book-Rating': 'num_ratings'}, inplace=True)

# We only want books with 50 or more ratings
popular_books = ratings_count[ratings_count['num_ratings'] >= 50]['Book-Title']

# Filter our main dataframe to only include these popular books
popular_df = df[df['Book-Title'].isin(popular_books)]

# 2. Filter by number of ratings per user
# Now, count how many ratings each user has given
user_ratings_count = popular_df.groupby('User-ID').count()['Book-Rating'].reset_index()
user_ratings_count.rename(columns={'Book-Rating': 'num_user_ratings'}, inplace=True)

# We only want users who have given 200 or more ratings
active_users = user_ratings_count[user_ratings_count['num_user_ratings'] >= 200]['User-ID']

# Filter our popular dataframe to only include these active users
final_df = popular_df[popular_df['User-ID'].isin(active_users)]

# Print the shape of our new, smaller, and cleaner dataframe
print("Shape of original dataframe:", df.shape)
print("Shape after filtering for popular books:", popular_df.shape)
print("Shape of final dataframe with active users:", final_df.shape)

# Display the first 5 rows of our final dataframe
print("\nFinal Dataframe:")
print(final_df.head())


# --- Start of New Code for Model Building ---

# Create a pivot table: rows are book titles, columns are users, values are ratings
book_pivot = final_df.pivot_table(index='ISBN', columns='User-ID', values='Book-Rating')
# Fill missing values (where a user hasn't rated a book) with 0
book_pivot.fillna(0, inplace=True)

# Print the shape of our pivot table
print("\nShape of our pivot table:", book_pivot.shape)
print(book_pivot.head())

# --- Calculate Similarity ---
from sklearn.metrics.pairwise import cosine_similarity

# Calculate the cosine similarity between every book
similarity_scores = cosine_similarity(book_pivot)

# Print the shape of our similarity matrix
print("\nShape of our similarity matrix:", similarity_scores.shape)


import pickle

# --- Start of Final Code ---

def recommend(book_name):
    # Find the index of the book that is passed in
    try:
        index = book_pivot.index.get_loc(book_name)
    except KeyError:
        return "Sorry, this book is not in our dataset. Please try another."

    # Get the similarity scores for that book with all other books
    similar_books = sorted(list(enumerate(similarity_scores[index])), key=lambda x: x[1], reverse=True)[1:6]

    # Print the titles of the top 5 most similar books
    recommendations = []
    for i in similar_books:
        recommendations.append(book_pivot.index[i[0]])

    return recommendations

# --- Test the function ---
book_isbn_to_test = '000648302X'
print(f"\nRecommendations for book with ISBN '{book_isbn_to_test}':")
print(recommend(book_isbn_to_test))

# --- Save the necessary objects for our API ---
pickle.dump(book_pivot, open('pivot.pkl', 'wb'))
pickle.dump(similarity_scores, open('similarity_scores.pkl', 'wb'))