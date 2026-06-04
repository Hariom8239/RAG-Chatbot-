import { useState } from "react"
import Upload from "./components/Upload"
import Chat from "./components/Chat"

export default function App() {
  const [documents, setDocuments] = useState([])
  const [selectedDocs, setSelectedDocs] = useState([])
  const [provider, setProvider] = useState("groq")

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "sans-serif", background: "#f0f2f5" }}>
      
      {/* Sidebar */}
      <div style={{ width: "300px", background: "#1e1e2e", color: "white", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <h2 style={{ margin: 0, fontSize: "18px", color: "#cba6f7" }}>RAG Research Assistant</h2>

        {/* Model Selector */}
        <div>
          <label style={{ fontSize: "12px", color: "#a6adc8" }}>LLM Provider</label>
          <select
            value={provider}
            onChange={e => setProvider(e.target.value)}
            style={{ width: "100%", marginTop: "6px", padding: "8px", borderRadius: "6px", background: "#313244", color: "white", border: "1px solid #45475a" }}
          >
            <option value="groq">Groq (Llama 3.1)</option>
            <option value="gemini">Gemini 1.5 Flash</option>
          </select>
        </div>

        {/* Upload */}
        <Upload documents={documents} setDocuments={setDocuments} />

        {/* Document List */}
        {documents.length > 0 && (
          <div>
            <label style={{ fontSize: "12px", color: "#a6adc8" }}>Filter by Document (optional)</label>
            <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "6px" }}>
              {documents.map(doc => (
                <label key={doc} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={selectedDocs.includes(doc)}
                    onChange={e => {
                      if (e.target.checked) setSelectedDocs([...selectedDocs, doc])
                      else setSelectedDocs(selectedDocs.filter(d => d !== doc))
                    }}
                  />
                  <span style={{ color: "#cdd6f4", wordBreak: "break-all" }}>{doc}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Chat provider={provider} selectedDocs={selectedDocs} documents={documents} />
      </div>

    </div>
  )
}