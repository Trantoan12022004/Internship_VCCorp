import requests
import json

def test_gemini_api(api_key):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={api_key}"
    
    headers = {
        "Content-Type": "application/json"
    }
    
    data = {
        "contents": [{
            "parts": [{
                "text": "Hello, this is a test message"
            }]
        }]
    }
    
    try:
        response = requests.post(url, headers=headers, data=json.dumps(data))
        
        if response.status_code == 200:
            print("✅ API key hoạt động bình thường!")
            print("Response:", response.json())
            return True
        else:
            print(f"❌ Lỗi: {response.status_code}")
            print("Error:", response.text)
            return False
            
    except Exception as e:
        print(f"❌ Lỗi kết nối: {e}")
        return False

# Sử dụng
api_key = "YOUR_API_KEY_HERE"
test_gemini_api(api_key)