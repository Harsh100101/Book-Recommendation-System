import pandas as pd
import numpy as np

print("Loading original books data...")
books = pd.read_csv('Books.csv', low_memory=False)

# Define a list of possible genres
genres = ['Fiction', 'Mystery', 'Science Fiction', 'Fantasy', 'Thriller', 'Romance', 'Non-Fiction', 'Biography']

# --- Add Genre ---
# Assign a random genre to each book
print("Assigning random genres...")
books['Genre'] = np.random.choice(genres, size=len(books))

# --- Add Price ---
# Generate a random price between 5.00 and 40.00 for each book
print("Generating random prices...")
books['Price'] = np.round(np.random.uniform(5.00, 40.00, size=len(books)), 2)

# Save the new, enriched dataframe to a new file
output_filename = 'books_enriched.csv'
print(f"Saving enriched data to {output_filename}...")
books.to_csv(output_filename, index=False)

print("Data augmentation complete!")
print(books[['Book-Title', 'Genre', 'Price']].head())