import pandas as pd
from app import app, db, Book

print("Starting database seed process...")

# Use the app context to interact with the database
with app.app_context():
    print("Deleting existing books to prevent duplicates...")
    db.session.query(Book).delete()
    db.session.commit()

    print("Loading data from books_enriched.csv...")
    books_df = pd.read_csv('books_enriched.csv', low_memory=False)

    books_df['ISBN'] = books_df['ISBN'].astype(str).str.strip()

    # Clean up column names to match our database model
    books_df.rename(columns={
        'ISBN': 'isbn',
        'Book-Title': 'title',
        'Book-Author': 'author',
        'Year-Of-Publication': 'year',
        'Publisher': 'publisher',
        'Image-URL-M': 'image_url_m',
        'Genre': 'genre',
        'Price': 'price'
    }, inplace=True)
    
    # Select only the columns we need for the Book model
    books_to_insert = books_df[['isbn', 'title', 'author', 'year', 'publisher', 'image_url_m', 'genre', 'price']].copy()
    
    # Remove duplicates based on ISBN to ensure uniqueness
    books_to_insert.drop_duplicates(subset=['isbn'], inplace=True)
    
    # Handle potential missing values that can cause errors
    books_to_insert['author'].fillna('Unknown', inplace=True)
    books_to_insert['publisher'].fillna('Unknown', inplace=True)
    books_to_insert['image_url_m'].fillna('', inplace=True)
    
    print(f"Preparing to insert {len(books_to_insert)} unique books into the database...")
    
    # Convert dataframe to a list of dictionaries and insert into the database
    books_data = books_to_insert.to_dict(orient='records')
    db.session.bulk_insert_mappings(Book, books_data)
    
    print("Committing changes to the database...")
    db.session.commit()
    print("Database seeding complete!")