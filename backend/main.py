import os
import shutil
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from ingest import ingest_document, list_documents, delete_document
from retriever import retrieve_chunks
from llm import ask_llm
from config import UPLOAD_DIR

app = FastAPI(title="RAG Research Assistant")

# Allow frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    question: str
    provider: Optional[str] = "groq"
    filenames: Optional[List[str]] = None

@app.get("/")
def root():
    return {"status": "RAG Assistant is running"}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    # Validate file type
    allowed = [".pdf", ".docx", ".xlsx", ".xls"]
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed:
        raise HTTPException(status_code=400, detail=f"File type {ext} not supported")

    # Save file
    filepath = os.path.join(UPLOAD_DIR, file.filename)
    with open(filepath, "wb") as f:
        shutil.copyfileobj(file.file, f)

    # Ingest into ChromaDB
    result = ingest_document(filepath, file.filename)
    return {"message": "File uploaded and ingested successfully", "details": result}

@app.get("/documents")
def get_documents():
    docs = list_documents()
    return {"documents": docs}

@app.delete("/documents/{filename}")
def remove_document(filename: str):
    delete_document(filename)
    return {"message": f"{filename} deleted successfully"}

@app.post("/query")
def query(request: QueryRequest):
    try:
        if not request.question.strip():
            raise HTTPException(status_code=400, detail="Question cannot be empty")

        chunks = retrieve_chunks(
            query=request.question,
            filenames=request.filenames
        )

        if not chunks:
            raise HTTPException(status_code=404, detail="No relevant content found in documents")

        result = ask_llm(
            question=request.question,
            chunks=chunks,
            provider=request.provider
        )

        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))