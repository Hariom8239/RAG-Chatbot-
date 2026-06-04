import chromadb
from chromadb.utils import embedding_functions
from config import CHROMA_DIR, EMBEDDING_MODEL, TOP_K_RESULTS

client = chromadb.PersistentClient(path=CHROMA_DIR)
embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name=EMBEDDING_MODEL
)
collection = client.get_or_create_collection(
    name="documents",
    embedding_function=embedding_fn
)

def retrieve_chunks(query, filenames=None, top_k=TOP_K_RESULTS):
    # Get total count of documents in collection
    total = collection.count()
    if total == 0:
        return []
    
    # Use minimum of top_k and total available
    n_results = min(top_k, total)

    where = None
    if filenames and len(filenames) == 1:
        where = {"filename": filenames[0]}
    elif filenames and len(filenames) > 1:
        where = {"$or": [{"filename": f} for f in filenames]}

    results = collection.query(
        query_texts=[query],
        n_results=n_results,
        where=where
    )

    chunks = []
    for i, doc in enumerate(results["documents"][0]):
        chunks.append({
            "text": doc,
            "filename": results["metadatas"][0][i]["filename"],
            "chunk_index": results["metadatas"][0][i]["chunk_index"]
        })

    return chunks

    