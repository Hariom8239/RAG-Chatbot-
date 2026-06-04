import { useState } from "react"
import axios from "axios"

export default function Chat({ provider, selectedDocs, documents }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    if (!input.trim()) return
    if (documents.length === 0) {
      alert("Please upload at least one document first")
      return
    }

    const userMsg = { role: "user", content: input }
    setMessages(prev => [...prev, userMsg])
    setInput("")
    setLoading(true)

    try {
      const res = await axios.post("http://172.28.99.159:8000/query", {
        question: input,
        provider: provider,
        filenames: selectedDocs.length > 0 ? selectedDocs : null
      })

      const botMsg = {
        role: "assistant",
        content: res.data.answer,
        sources: res.data.sources,
        model: res.data.model
      }
      setMessages(prev => [...prev, botMsg])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `Error: ${err.response?.data?.detail || err.message}`
      }])
    }

    setLoading(false)
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", color: "#888", marginTop: "60px" }}>
            <h3>Upload documents and ask anything</h3>
            <p>Supports PDF, DOCX, and XLSX files</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "75%", padding: "12px 16px", borderRadius: "12px",
              background: msg.role === "user" ? "#cba6f7" : "white",
              color: msg.role === "user" ? "white" : "#1e1e2e",
              boxShadow: "0 1px 4px rgba(0,0,0,0.1)"
            }}>
              <p style={{ margin: 0, whiteSpace: "pre-wrap", lineHeight: "1.6" }}>{msg.content}</p>
              {msg.sources && (
                <div style={{ marginTop: "8px", fontSize: "11px", color: "#888" }}>
                  Sources: {msg.sources.join(", ")} · {msg.model}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{ background: "white", padding: "12px 16px", borderRadius: "12px", color: "#888" }}>
              Thinking...
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ padding: "16px", background: "white", borderTop: "1px solid #eee", display: "flex", gap: "10px" }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder="Ask a question about your documents..."
          style={{ flex: 1, padding: "12px 16px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", outline: "none" }}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          style={{ padding: "12px 24px", background: "#cba6f7", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "bold" }}
        >
          Send
        </button>
      </div>

    </div>
  )
}