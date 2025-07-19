import requests
import json

def list_available_models(api_key):
    """Liệt kê các model có sẵn"""
    url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
    
    try:
        response = requests.get(url)
        if response.status_code == 200:
            models = response.json()
            print("📋 Các model có sẵn:")
            for model in models.get('models', []):
                name = model.get('name', '')
                supported_methods = model.get('supportedGenerationMethods', [])
                print(f"  - {name} | Methods: {supported_methods}")
            return models
        else:
            print(f"❌ Không thể lấy danh sách model: {response.status_code}")
            print(response.text)
            return None
    except Exception as e:
        print(f"❌ Lỗi khi lấy danh sách model: {e}")
        return None

def test_gemini_api(api_key, model_name="models/gemini-1.5-flash"):
    """Test API với model cụ thể"""
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
    
    headers = {
        "Content-Type": "application/json"
    }
    
    data = {
        "contents": [{
            "parts": [{
                "text": "Hello, this is a test message. Please respond to confirm API is working."
            }]
        }]
    }
    
    try:
        print(f"🔄 Testing model: {model_name}")
        print(f"🔄 API key: {api_key[:10]}...")
        
        response = requests.post(url, headers=headers, data=json.dumps(data))
        
        if response.status_code == 200:
            print("✅ API key và model hoạt động bình thường!")
            result = response.json()
            
            # Trích xuất text từ response
            if 'candidates' in result and len(result['candidates']) > 0:
                text_response = result['candidates'][0]['content']['parts'][0]['text']
                print(f"📄 Response: {text_response}")
            
            return True, result
        else:
            print(f"❌ Lỗi HTTP: {response.status_code}")
            print(f"📄 Error: {response.text}")
            return False, None
            
    except Exception as e:
        print(f"❌ Lỗi kết nối: {e}")
        return False, None

def test_multiple_models(api_key):
    """Test nhiều model khác nhau"""
    # Danh sách các model phổ biến để test
    models_to_test = [
        "models/gemini-1.5-flash",
        "models/gemini-1.5-pro", 
        "models/gemini-pro",
        "models/gemini-1.0-pro",
        "gemini-1.5-flash",  # Thử không có prefix "models/"
        "gemini-1.5-pro",
        "gemini-pro"
    ]
    
    print("🧪 Testing multiple models...")
    
    for model in models_to_test:
        print(f"\n--- Testing {model} ---")
        success, result = test_gemini_api(api_key, model)
        if success:
            print(f"✅ Model {model} hoạt động!")
            return model
        else:
            print(f"❌ Model {model} không hoạt động")
    
    return None

# Main execution
if __name__ == "__main__":
    api_key = "AIzaSyDgmFxM35AawEq5EUbbn1lqcmjobM7XqLs"
    
    print("🚀 Bắt đầu kiểm tra Gemini API...")
    print("=" * 50)
    
    # Bước 1: Liệt kê các model có sẵn
    print("\n1️⃣ Lấy danh sách model có sẵn:")
    list_available_models(api_key)
    
    # Bước 2: Test các model phổ biến
    print("\n2️⃣ Test các model phổ biến:")
    working_model = test_multiple_models(api_key)
    
    if working_model:
        print(f"\n🎉 Tìm thấy model hoạt động: {working_model}")
        print(f"💡 Sử dụng model này trong Node.js:")
        print(f"   model: \"{working_model}\"")
        print(f"💡 API key để thêm vào .env:")
        print(f"   GEMINI_API_KEY={api_key}")
    else:
        print("\n💥 Không có model nào hoạt động với API key này")
        print("🔗 Hãy kiểm tra lại API key tại: https://aistudio.google.com/app/apikey")