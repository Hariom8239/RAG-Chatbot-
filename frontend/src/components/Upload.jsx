import { useState } from "react"
import axios from "axios"

export default function Upload({ documents, setDocuments }) {
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState("")

  const fetchDocuments = async () => {
    const res = await axios.get("http://172.28.99.159:8000/documents")
    setDocuments(res.data.documents)
  }

  const handleUpload = async (e) => {
    const files = e.target.files
    if (!files.length) return
    setUploading(true)
    setMessage("")

    for (const file of files) {
      const formData = new FormData()
      formData.append("file", file)
      try {
        await axios.post("http://172.28.99.159:8000/upload", formData)
        setMessage(`Uploaded: ${file.name}`)
      } catch (err) {
        setMessage(`Error: ${err.response?.data?.detail || err.message}`)
      }
    }

    await fetchDocuments()
    setUploading(false)
  }

  const handleDelete = async (filename) => {
    await axios.delete(`http://172.28.99.159:8000/documents/${filename}`)
    await fetchDocuments()
  }

  // Load documents on first render
  useState(() => { fetchDocuments() }, [])

  return (
    <div>
      <label style={{ fontSize: "12px", color: "#a6adc8" }}>Upload Documents</label>
      <label style={{
        display: "block", marginTop: "6px", padding: "10px",
        background: "#313244", border: "2px dashed #45475a",
        borderRadius: "8px", textAlign: "center", cursor: "pointer", fontSize: "13px", color: "#cdd6f4"
      }}>
        {uploading ? "Uploading..." : "Click to upload PDF / DOCX / XLSX"}
        <input type="file" multiple accept=".pdf,.docx,.xlsx,.xls" onChange={handleUpload} style={{ display: "none" }} />
      </label>
      {message && <p style={{ fontSize: "12px", color: "#a6e3a1", marginTop: "6px" }}>{message}</p>}

      {documents.length > 0 && (
        <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "4px" }}>
          {documents.map(doc => (
            <div key={doc} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#313244", padding: "6px 10px", borderRadius: "6px" }}>
              <span style={{ fontSize: "12px", color: "#cdd6f4", wordBreak: "break-all" }}>{doc}</span>
              <button onClick={() => handleDelete(doc)} style={{ background: "none", border: "none", color: "#f38ba8", cursor: "pointer", fontSize: "14px" }}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}