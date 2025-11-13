import { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    // Quand un message arrive
    socket.on("receive-message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("receive-message");
    };
  }, []);

  const sendMessage = () => {
    const userId = localStorage.getItem("userId");
    const username = localStorage.getItem("username");

    if (!input.trim() || !userId || !username) return;

    const msg = {
      userId,
      username,
      content: input,
    };

    socket.emit("send-message", msg);

    setInput("");
  };

  return (
    <div className="chat-container">
      <h2>💬 Chat général</h2>

      <div className="messages-box">
        {messages.map((m, i) => (
          <p key={i}>
            <strong>{m.username} :</strong> {m.content}
          </p>
        ))}
      </div>

      <div className="send-box">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Écrire un message..."
        />
        <button onClick={sendMessage}>Envoyer</button>
      </div>
    </div>
  );
}