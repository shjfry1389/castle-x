import { supabase } from "../supabase";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";


export default function Messages() {
const [conversations, setConversations] =
useState([]);

const [search, setSearch] =
useState("");

useEffect(() => {
  const token = localStorage.getItem("token");

  const loadConversations = () => {
    api
      .get("/api/conversations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        const sorted = [...res.data].sort((a, b) => {
          const unreadDiff = (b.unread_count || 0) - (a.unread_count || 0);

          if (unreadDiff !== 0) return unreadDiff;

          return (
            new Date(b.last_message_time || 0) -
            new Date(a.last_message_time || 0)
          );
        });

        setConversations(sorted);
      })
      .catch(console.error);
  };

  loadConversations();

  const channel = supabase
    .channel("messages-page")
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "users",
      },
      () => {
        loadConversations();
      }
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "messages",
      },
      () => {
        loadConversations();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);

const filtered =
conversations.filter((c) =>
c.user?.username
?.toLowerCase()
.includes(search.toLowerCase())
);

return (
<div
style={{
maxWidth: "700px",
margin: "0 auto",
background: "#fff",
minHeight: "100vh",
borderLeft: "1px solid #eff3f4",
borderRight: "1px solid #eff3f4",
}}
>
<div
  style={{
    position: "sticky",
    top: 0,
    background: "#fff",
    padding: "20px",
    borderBottom: "1px solid #eff3f4",
    zIndex: 10,
  }}
>
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "12px",
      marginBottom: "15px",
    }}
  >
    <Link
      to="/"
      style={{
        textDecoration: "none",
        fontSize: "22px",
        color: "#000",
        fontWeight: "bold",
      }}
    >
      ←
    </Link>

    <h1
      style={{
        margin: 0,
      }}
    >
      💬 Messages
    </h1>
  </div>

  <input
    placeholder="Search messages..."
      value={search}
      onChange={(e) =>
        setSearch(e.target.value)
      }
      style={{
        width: "100%",
        padding: "12px 18px",
        borderRadius: "999px",
        border: "1px solid #ddd",
        outline: "none",
        fontSize: "15px",
      }}
    />
  </div>

  {filtered.length === 0 ? (
    <div
      style={{
        textAlign: "center",
        padding: "80px 20px",
        color: "#536471",
      }}
    >
      <h2>
        No conversations
      </h2>

      <p>
        Start chatting with
        someone
      </p>
    </div>
  ) : (
    filtered.map((c) => (
      <Link
        key={c.conversation_id}
        to={`/chat/${c.conversation_id}`}
        style={{
          textDecoration: "none",
          color: "inherit",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            padding: "16px",
            borderBottom:
              "1px solid #eff3f4",
            transition: "0.2s",
            cursor: "pointer",
          }}
onMouseEnter={(e) => {
  e.currentTarget.style.background =
    document.body.classList.contains("dark")
      ? "#202327"
      : "#f7f9f9";
}}

onMouseLeave={(e) => {
  e.currentTarget.style.background =
    document.body.classList.contains("dark")
      ? "#000000"
      : "#fff";
}}
        >
          <div
            style={{
              position: "relative",
            }}
          >
            <img
              src={
                c.user
                  ?.avatar_url ||
                "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
              }
              alt=""
              style={{
                width: "58px",
                height: "58px",
                borderRadius:
                  "50%",
                objectFit:
                  "cover",
              }}
            />

            <div
              style={{
                position:
                  "absolute",
                right: 0,
                bottom: 0,
                width: "14px",
                height: "14px",
                borderRadius:
                  "50%",
                background:
                  c.user
                    ?.is_online
                    ? "#22c55e"
                    : "#9ca3af",
                border:
                  "2px solid white",
              }}
            />
          </div>

          <div
            style={{
              flex: 1,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems:
                  "center",
                gap: "6px",
              }}
            >
              <strong>
                {c.user
                  ?.display_name ||
                  c.user
                    ?.username}
              </strong>

              {c.user?.role ===
              "admin" ? (
                <span
                  style={{
                    color:
                      "#FFD700",
                    filter:
                      "drop-shadow(0 0 4px gold)",
                  }}
                >
                  👑
                </span>
              ) : c.user
                  ?.is_verified ? (
                <span
                  style={{
                    color:
                      "#1d9bf0",
                  }}
                >
                  ✅
                </span>
              ) : null}
              
            </div>

            <div
              style={{
                color:
                  "#536471",
                fontSize:
                  "14px",
              }}
            >
              @
              {
                c.user
                  ?.username
              }
            </div>

            <div
              style={{
                fontSize:
                  "13px",
                marginTop:
                  "4px",
                color:
                  "#666",
              }}
            >
              {c
                .last_message ||
                "No messages yet"}
            </div>
          </div>

          <div
            style={{
              textAlign:
                "right",
            }}
          >
            <div
              style={{
                fontSize:
                  "12px",
                color:
                  "#888",
              }}
            >
              {c.last_message_time ||
                ""}
            </div>
            {c.unread_count > 0 && (
  <div
    style={{
      marginTop: "6px",
      minWidth: "22px",
      height: "22px",
      padding: "0 7px",
      borderRadius: "999px",
      background: "#ef4444",
      color: "#fff",
      fontSize: "12px",
      fontWeight: "900",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {c.unread_count > 9 ? "9+" : c.unread_count}
  </div>
)}

            <div
              style={{
                marginTop:
                  "5px",
                fontSize:
                  "12px",
                color:
                  c.user
                    ?.is_online
                    ? "#22c55e"
                    : "#999",
              }}
            >
              {c.user
                ?.is_online
                ? "🟢 Online"
                : "⚫ Offline"}
            </div>
          </div>
        </div>
      </Link>
    ))
  )}
</div>


);
}
