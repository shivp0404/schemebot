import os
import requests
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

api_key = os.getenv("HF_TOKEN")

headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json",
    "HTTP-Referer": "http://localhost:5000"
}

def call_openrouter(user_input):
    
    prompt = f"""
Suggest 3 Indian government schemes for the following person:

{user_input}


Return the answer in strictly this JSON format:
[
  {{"name": "Scheme Name", "benefit": "Short description", "link": "https://example.com"}},
  ...
]
Only respond with the JSON array.
"""

    payload = {
        "model": "mistralai/mistral-7b-instruct",
        "messages": [
            {"role": "system", "content": "You are a helpful assistant that only responds with JSON."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7
    }
   

    try:
        response = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload)
     
        data = response.json()
        raw_text = data["choices"][0]["message"]["content"]
        # print("📨 Raw:", raw_text)
        return jsonify({"schemes": eval(raw_text)})  # Caution: safe only if you're in control of LLM output
    except Exception as e:
        print("❌ Error:", e)
        return jsonify({"schemes": []})

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/get_schemes", methods=["POST"])
def get_schemes():
    data = request.get_json()
    age = data.get("age", "")
    gender = data.get("gender", "")
    state = data.get("state", "")
    purpose = data.get("need", "")
    
    if not all([age, gender, state, purpose]):
        return jsonify({"schemes": [], "error": "Missing input fields"}), 400

    user_input = f"I'm a {age}-year-old {gender} from {state}. I'm looking for {purpose} goverment schemes."

    return call_openrouter(user_input)

   

if __name__ == "__main__":
    app.run(debug=True)
