#!/usr/bin/env python3
import requests
import json

# Replace with your actual API endpoint and credentials if applicable
API_URL = "http://localhost:8000/api/llm"  
HEADERS = {"Content-Type": "application/json"}

# Choose one of the test prompts from above:
prompt = (
    "Read the central loader file at ./optimized-rules/loader.md. "
    "This file aggregates all the modular rules and related instructions. "
    "List all the modules referenced in the file and provide a brief explanation of each."
)

payload = {
    "prompt": prompt,
    "max_tokens": 500,   # Adjust as needed
    "temperature": 0.2   # Lower temperature for deterministic output
}

response = requests.post(API_URL, headers=HEADERS, data=json.dumps(payload))

if response.status_code == 200:
    output = response.json().get("response", "")
    print("LLM Output:\n", output)
else:
    print("Error:", response.status_code, response.text)