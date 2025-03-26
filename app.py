from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from google import genai
import os
from dotenv import load_dotenv
import json

load_dotenv()

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the public directory
app.mount("/", StaticFiles(directory="public", html=True), name="public")

gemini_api_key = os.getenv("GOOGLE_API_KEY")
if not gemini_api_key:
    raise ValueError("GOOGLE_API_KEY environment variable is not set")

client = genai.Client(api_key=gemini_api_key)

# Define chat context
CHAT_CONTEXT = """
You are an AI assistant for Boobalamurugan's portfolio website. You should:
1. Be friendly and professional
2. Provide detailed information about Boobalamurugan's background, skills, and projects
3. Help visitors understand his expertise in Machine Learning, Computer Vision, and LLMs
4. Assist with potential collaboration opportunities
5. Answer questions about his projects and technical skills

Key Information:
- Final year B.Tech student at Knowledge Institute of Technology
- Expertise in Computer Vision, Machine Learning, and LLMs
- Projects include Automated Fire Detection and Football AI
- Proficient in Python, C++, PyTorch, and OpenCV
- Passionate about solving real-world problems with AI

Keep responses concise but informative, and maintain a professional tone.
"""

class ChatInput(BaseModel):
    message: str

@app.get("/chat")
async def get_chat():
    return {"message": "Please use POST method for chat interactions"}

@app.post("/chat")
async def chat(chat_input: ChatInput):
    try:
        # Prepare the prompt with context
        prompt = f"{CHAT_CONTEXT}\n\nUser: {chat_input.message}\nAssistant:"
        
        # Generate response
        response = client.models.generate_content(
            model="gemini-pro",
            content=prompt,
            generation_config={
                "temperature": 0.7,
                "top_p": 0.8,
                "top_k": 40,
                "max_output_tokens": 1024,
            },
            safety_settings={
                "harassment": "block_none",
                "hate_speech": "block_none",
                "sexually_explicit": "block_none",
                "dangerous_content": "block_none",
            }
        )

        # Format the response
        formatted_response = response.text.strip()
        
        # Add markdown formatting if needed
        if "```" in formatted_response:
            formatted_response = formatted_response.replace("```python", "```").replace("```", "")
        
        return {"response": formatted_response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
