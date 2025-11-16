import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { RiChat3Line, RiSendPlane2Line } from "@remixicon/react";

const socket = io("http://localhost:3000");

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
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

    const msg = { userId, username, content: input };

    socket.emit("send-message", msg);
    setInput("");
  };

  return (
    <div className="w-full h-full max-w-3xl mx-auto flex flex-col bg-white rounded-xl shadow-md border border-gray-200">
      {/* HEADER */}
      <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
        <RiChat3Line size={22} />
        <h2 className="text-lg font-semibold">Chat général</h2>
      </div>

      {/* MESSAGE AREA */}
      <div className="flex-1 overflow-y-auto mt-3 space-y-2 pr-2">
        {messages.map((m, i) => (
          <div
            key={i}
            className="p-2 rounded-lg bg-gray-100 border border-gray-200"
          >
            <p className="text-sm">
              <span className="font-semibold text-gray-800">{m.username}</span>
              <span className="text-gray-600"> — {m.content}</span>
            </p>
          </div>
        ))}
      </div>

      {/* SEND BAR */}
      <div className="mt-3 flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Écrire un message..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm 
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg 
                     hover:bg-blue-700 transition flex items-center gap-1"
        >
          <RiSendPlane2Line size={20} />
        </button>
      </div>
    </div>
  );
}