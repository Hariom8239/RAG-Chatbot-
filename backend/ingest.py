import os
import fitz
import docx
import pandas as pd
import chromadb
from chromadb.utils import embedding_functions
from langchain_text_splitters import RecursiveCharacterTextSplitter
from config import CHROMA_DIR, UPLOAD_DIR, CHUNK_SIZE, CHUNK_OVERLAP, EMBEDDING_MODEL

client = chromadb.PersistentClient(path=CHROMA_DIR)
embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name=EMBEDDING_MODEL
)
collection = client.get_or_create_collection(
    name="documents",
    embedding_function=embedding_fn
)

splitter = RecursiveCharacterTextSplitter(
    chunk_size=CHUNK_SIZE,
    chunk_overlap=CHUNK_OVERLAP
)

def extract_pdf(filepath):
    text = ""
    doc = fitz.open(filepath)
    for page in doc:
        text += page.get_text()
    return text

def extract_docx(filepath):
    doc = docx.Document(filepath)
    return "\n".join([para.text for para in doc.paragraphs])

def extract_xlsx(filepath):
    dfs = pd.read_excel(filepath, sheet_name=None)
    text = ""
    for sheet_name, df in dfs.items():
        text += f"\nSheet: {sheet_name}\n"
        text += df.to_string(index=False)
    return text

def extract_text(filepath):
    ext = os.path.splitext(filepath)[1].lower()
    if ext == ".pdf":
        return extract_pdf(filepath)
    elif ext == ".docx":
        return extract_docx(filepath)
    elif ext in [".xlsx", ".xls"]:
        return extract_xlsx(filepath)
    else:
        raise ValueError(f"Unsupported file type: {ext}")

def ingest_document(filepath, filename):
    text = extract_text(filepath)
    if not text.strip():
        raise ValueError("No text could be extracted from this file")
    chunks = splitter.split_text(text)
    ids = [f"{filename}_chunk_{i}" for i in range(len(chunks))]
    metadatas = [{"filename": filename, "chunk_index": i} for i in range(len(chunks))]
    try:
        existing = collection.get(where={"filename": filename})
        if existing["ids"]:
            collection.delete(where={"filename": filename})
    except:
        pass
    collection.add(documents=chunks, ids=ids, metadatas=metadatas)
    return {"filename": filename, "chunks": len(chunks), "characters": len(text)}

def list_documents():
    results = collection.get()
    filenames = list(set([m["filename"] for m in results["metadatas"]])) if results["metadatas"] else []
    return filenames

def delete_document(filename):
    collection.delete(where={"filename": filename})
    return True