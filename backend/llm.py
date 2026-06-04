import groq
import google.generativeai as genai
from config import (
    GROQ_API_KEY, GEMINI_API_KEY,
    GROQ_MODEL, GEMINI_MODEL
)

# Initialize clients
groq_client = groq.Groq(api_key=GROQ_API_KEY)
genai.configure(api_key=GEMINI_API_KEY)
gemini_model = genai.GenerativeModel(GEMINI_MODEL)

def build_prompt(question: str, chunks: list) -> str:
    context = ""
    for i, chunk in enumerate(chunks):
        context += f"\n--- Source {i+1}: {chunk['filename']} ---\n"
        context += chunk["text"] + "\n"

    prompt = f"""You are a helpful research assistant. Answer the user's question 
based ONLY on the provided document context below. 
If the answer is not found in the context, say "I could not find this information in the provided documents."
Always mention which document/source your answer came from.

CONTEXT:
{context}

QUESTION:
{question}

ANSWER:"""
    return prompt

def ask_groq(question: str, chunks: list) -> dict:
    prompt = build_prompt(question, chunks)
    response = groq_client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2
    )
    answer = response.choices[0].message.content
    return {
        "answer": answer,
        "model": GROQ_MODEL,
        "provider": "groq",
        "sources": list(set([c["filename"] for c in chunks]))
    }

def ask_gemini(question: str, chunks: list) -> dict:
    prompt = build_prompt(question, chunks)
    response = gemini_model.generate_content(prompt)
    answer = response.text
    return {
        "answer": answer,
        "model": GEMINI_MODEL,
        "provider": "gemini",
        "sources": list(set([c["filename"] for c in chunks]))
    }

def ask_llm(question: str, chunks: list, provider: str = "groq") -> dict:
    if provider == "gemini":
        return ask_gemini(question, chunks)
    return ask_groq(question, chunks)