import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { RiSendPlane2Line, RiSendPlane2Fill } from "@remixicon/react";

const socket = io("http://localhost:3000");

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const currentUser = localStorage.getItem("username");

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch("http://localhost:3000/messages");
        const data = await res.json();

        if (Array.isArray(data.data)) {
          setMessages(data.data);
        }
      } catch (error) {
        console.error("Erreur GET /messages:", error);
      }
    };

    fetchMessages();

    socket.on("receive-message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => socket.off("receive-message");
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
    <div className="w-80 h-[30rem] rounded-lg bg-white shadow-lg border border-gray-200 flex flex-col min-h-0">
      
      {/* HEADER */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
        <div className="font-semibold">Chat général</div>
      </div>

      {/* MESSAGE LIST */}
      <ul className="flex-1 overflow-y-auto p-3 space-y-4 min-h-0">
        {messages.map((m: any) => {
          const isMe = m.username === currentUser;
          return (
            <li
              key={m.id}
              className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
            >
              {/* Timestamp */}
              <div className="text-xs text-gray-400">
                {new Date(m.createdat).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>

              {/* Bubble */}
              <div
                className={`rounded-lg px-3 py-2 text-sm border ${
                  isMe
                    ? "bg-blue-600/80 text-white border-blue-600"
                    : "bg-gray-100 border-gray-200 text-gray-800"
                }`}
              >
                {!isMe && (
                  <div className="font-bold text-gray-700">
                    {m.username}
                  </div>
                )}
                {m.content}
              </div>
            </li>
          );
        })}
      </ul>

      {/* INPUT BAR */}
      <div className="relative border-t border-gray-200 bg-gray-100 rounded-b-lg">
        <input
          type="text"
          placeholder="Répondre..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="h-10 w-full bg-gray-100 pl-3 pr-10 text-sm focus:outline-blue-600/50 rounded-b-lg"
        />

        <button
          onClick={sendMessage}
          className="absolute top-0 bottom-0 right-1 my-auto p-2 rounded-full text-blue-600 transition group"
          aria-label="Envoyer"
        >
          <RiSendPlane2Line size={18} className="block group-hover:hidden" />
          <RiSendPlane2Fill size={18} className="hidden group-hover:block" />
        </button>
      </div>
    </div>
  );
}