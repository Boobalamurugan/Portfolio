from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
from google import genai
import os
from dotenv import load_dotenv

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

# Mount static files directory
app.mount("/static", StaticFiles(directory="static"), name="static")

gemini_api_key = os.getenv("GOOGLE_API_KEY")
if not gemini_api_key:
    raise ValueError("GOOGLE_API_KEY environment variable is not set")

client = genai.Client(api_key=gemini_api_key)

class ChatInput(BaseModel):
    message: str

@app.get("/", response_class=HTMLResponse)
async def root():
    # Read and return the HTML file content
    with open("static/index.html", "r") as f:
        return f.read()

@app.post("/chat")
async def chat(chat_input: ChatInput):
    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            content=chat_input.message,
        )
        return {"response": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
