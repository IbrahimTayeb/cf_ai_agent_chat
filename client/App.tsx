import React, { useState } from "react";
import { useAgent } from "agents/react";

export default function App() {
  const { sendMessage, messages, connecting } = useAgent({ agentName: "MyAgent" });
  const [input, setInput] = useState("");

  const handleSend = async () => {
    await sendMessage({ message: input, userId: "guest" });
    setInput("");
  };

  return (
    <div className="chat-container">
      <h2>Cloudflare AI Chat</h2>
      <div className="messages">
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>
            <b>{m.role}:</b> {m.text}
          </div>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type message..."
      />
      <button onClick={handleSend} disabled={connecting}>Send</button>
    </div>
  );
}
