from google import genai
from google.genai import types
from dotenv import load_dotenv
import os

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

SYSTEM_PROMPT = """You are NeuraBot, an AI medical assistant for ApexNeura platform.
Gather patient information BEFORE image analysis through conversation.

CRITICAL RULE: You must ask EXACTLY 3 questions. Not 4, not 2. Exactly 3.

Track the conversation:
- If patient has answered 0 questions: Ask question 1 only
- If patient has answered 1 question: Ask question 2 only
- If patient has answered 2 questions: Ask question 3 only
- If patient has answered 3 or more questions: Say ONLY "Thank you for sharing. Please upload your image now for AI analysis." — nothing else, no more questions.

RULES:
- Respond in SAME language as patient (Hindi/English/Hinglish)
- NEVER re-introduce yourself after first message
- Be warm, empathetic, professional
- NEVER diagnose — only gather information
- SHORT responses only (2-3 sentences max)

For DeepDown (skin): Q1= Ask about duration/changes, Q2=symptoms/family history, Q3=medications
For AlzMind (brain/memory): Q1=symptoms/duration, Q2=family history/age, Q3=daily functioning"""

sessions: dict = {}

def get_session(session_id: str):
    if session_id not in sessions:
        sessions[session_id] = []
    return sessions[session_id]

def clear_session(session_id: str):
    if session_id in sessions:
        del sessions[session_id]

def chat(session_id: str, user_message: str, module: str = "general") -> str:
    try:
        history = get_session(session_id)

        module_ctx = ""
        if module == "deepdown":
            module_ctx = "\nModule: DeepDown - Skin Analysis. Focus on dermatology questions."
        elif module == "alzmind":
            module_ctx = "\nModule: AlzMind - Brain MRI. Focus on memory/neurology questions."

        # Build contents for API
        contents = []
        for msg in history:
            # BUG FIX: Google GenAI only accepts "user" or "model" — not "assistant"
            role = "user" if msg["role"] == "user" else "model"
            contents.append(types.Content(
                role=role,
                parts=[types.Part(text=msg["content"])]
            ))

        contents.append(types.Content(
            role="user",
            parts=[types.Part(text=user_message)]
        ))

        response = client.models.generate_content(
          
            model="gemini-2.5-flash",
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT + module_ctx,
                temperature=0.7,
            )
        )

        reply = response.text

        # BUG FIX: save as "model" not "assistant" for consistency
        history.append({"role": "user",  "content": user_message})
        history.append({"role": "model", "content": reply})

        # Keep last 20 messages only
        if len(history) > 20:
            sessions[session_id] = history[-20:]

        return reply

    except Exception as e:

        print(f"Gemini error: {e}")
        err = str(e)
        if "429" in err or "RESOURCE_EXHAUSTED" in err:
            return "Please Try After Sometime...🥲"
        if "503" in err or "UNAVAILABLE" in err:
            return "Server busy hai, 10 seconds baad try karein...😐"
        raise

def get_history(session_id: str) -> list:
    return get_session(session_id)