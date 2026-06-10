import { supabase } from "../supabase";
import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";

export default function Chat() {
const { conversationId } = useParams();

const [messages, setMessages] = useState([]);
const [content, setContent] = useState("");

const messagesEndRef = useRef(null);

const token = localStorage.getItem("token");

const currentUserId = token
? JSON.parse(atob(token.split(".")[1])).id
: null;

const scrollToBottom = () => {
messagesEndRef.current?.scrollIntoView({
behavior: "smooth",
});
};

const loadMessages = () => {
if (!token) return;


api
  .get(`/api/messages/${conversationId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  .then((res) => {
    setMessages(res.data);
  })
  .catch(console.error);


};

useEffect(() => {
scrollToBottom();
}, [messages]);

useEffect(() => {
loadMessages();


const channel = supabase
  .channel(`chat-${conversationId}`)
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "messages",
    },
    (payload) => {
      if (
        String(payload.new.conversation_id) ===
        String(conversationId)
      ) {
        setMessages((prev) => [
          ...prev,
          payload.new,
        ]);
      }
    }
  )
  .subscribe();

return () => {
  supabase.removeChannel(channel);
};


}, [conversationId]);

const sendMessage = async () => {
try {
if (!content.trim()) return;


  await api.post(
    "/api/messages/send",
    {
      conversation_id: conversationId,
      content,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  setContent("");
} catch (err) {
  console.error(err);
}


};

return (
<div
style={{
maxWidth: "800px",
margin: "0 auto",
height: "100vh",
display: "flex",
flexDirection: "column",
background: "#fff",
}}
>
<div
  style={{
    padding: "18px",
    borderBottom: "1px solid #e5e7eb",
    position: "sticky",
    top: 0,
    background: "#fff",
    zIndex: 10,
    display: "flex",
    alignItems: "center",
    gap: "12px",
  }}
>
  <Link
    to="/messages"
    style={{
      textDecoration: "none",
      color: "#000",
      fontSize: "24px",
      fontWeight: "bold",
    }}
  >
    ←
  </Link>

  <span
    style={{
      fontWeight: "700",
      fontSize: "20px",
    }}
  >
    💬 Chat
  </span>
</div>


  <div
    style={{
      flex: 1,
      overflowY: "auto",
      padding: "20px",
      background: "#f8fafc",
    }}
  >
    {messages.map((msg) => (
      <div
        key={msg.id}
        style={{
          display: "flex",
          justifyContent:
            msg.sender_id === currentUserId
              ? "flex-end"
              : "flex-start",
          marginBottom: "12px",
        }}
      >
        <div
          style={{
            background:
              msg.sender_id === currentUserId
                ? "#1d9bf0"
                : "#fff",
            color:
              msg.sender_id === currentUserId
                ? "#fff"
                : "#111",
            padding: "12px 16px",
            borderRadius: "18px",
            maxWidth: "70%",
            wordBreak: "break-word",
            boxShadow:
              "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <div>{msg.content}</div>

          <div
            style={{
              fontSize: "11px",
              opacity: 0.7,
              marginTop: "5px",
              textAlign: "right",
            }}
          >
            {msg.created_at
              ? new Date(
                  msg.created_at
                ).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : ""}
          </div>
        </div>
      </div>
    ))}

    <div ref={messagesEndRef} />
  </div>

  <div
    style={{
      padding: "15px",
      borderTop: "1px solid #e5e7eb",
      display: "flex",
      gap: "10px",
      background: "#fff",
    }}
  >
    <input
      value={content}
      onChange={(e) =>
        setContent(e.target.value)
      }
      placeholder="Write a message..."
      style={{
        flex: 1,
        padding: "14px",
        borderRadius: "999px",
        border: "1px solid #d1d5db",
        outline: "none",
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          sendMessage();
        }
      }}
    />

    <button
      onClick={sendMessage}
      style={{
        border: "none",
        background: "#1d9bf0",
        color: "#fff",
        padding: "0 22px",
        borderRadius: "999px",
        cursor: "pointer",
        fontWeight: "bold",
      }}
    >
      Send
    </button>
  </div>
</div>


);
}
