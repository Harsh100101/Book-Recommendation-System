import io
import os
import pytest
from supabase import create_client, Client

# --- Load Supabase Credentials from .env ---
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

@pytest.fixture(scope="module")
def supabase_client():
    assert SUPABASE_URL and SUPABASE_KEY, "❌ Missing Supabase credentials in environment!"
    client: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    return client


def test_supabase_upload(supabase_client):
    """
    Test uploading a file to Supabase Storage with overwrite enabled (upsert=True)
    """
    bucket_name = "profile-photo"
    file_path = "pytest/test_file.png"

    # Create a fake PNG in memory
    file_data = io.BytesIO(b"\x89PNG\r\n\x1a\nTEST_IMAGE_DATA")

    # Upload the file with overwrite enabled
    result = supabase_client.storage.from_(bucket_name).upload(
        path=file_path,
        file=file_data.getvalue(),
        file_options={
            "content-type": "image/png",
            "upsert": "true"  # ✅ Allow overwriting
        }
    )

    assert result, "❌ Upload returned no response!"
    print("✅ Upload successful:", result)

    # Verify the uploaded file publicly
    public_url = f"{SUPABASE_URL}/storage/v1/object/public/{bucket_name}/{file_path}"
    print("🌐 Public URL:", public_url)
    assert "supabase.co" in public_url


def test_supabase_file_list(supabase_client):
    """
    Test listing files in the 'pytest' directory to confirm upload
    """
    bucket_name = "profile-photo"
    file_list = supabase_client.storage.from_(bucket_name).list("pytest")

    print("📂 Files found:", [f['name'] for f in file_list])
    assert any(f['name'] == "test_file.png" for f in file_list)
