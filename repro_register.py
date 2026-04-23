import requests
import os

BASE_URL = "http://localhost:8000/api"

def test_register():
    url = f"{BASE_URL}/register/"
    
    # Create a real dummy image with PIL
    from PIL import Image
    import io
    img = Image.new('RGB', (100, 100), color = (73, 109, 137))
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='JPEG')
    img_bytes = img_byte_arr.getvalue()
    
    data = {
        "name": "Test Child",
        "age": "10",
        "gender": "male",
        "last_seen_location": "Test Location",
        "contact_number": "1234567890"
    }
    
    files = {"image": ("test_image.jpg", img_bytes, "image/jpeg")}
    response = requests.post(url, data=data, files=files)
    
    print(f"Status Code: {response.status_code}")
    with open("repro_output.json", "w") as f:
        import json
        json.dump(response.json(), f, indent=2)
    print("Response saved to repro_output.json")

if __name__ == "__main__":
    test_register()
