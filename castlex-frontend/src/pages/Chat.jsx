import { supabase } from "../supabase";
import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";

function BlueVerifiedBadge({ size = 19 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size}>
      <path
        fill="#1D9BF0"
        d="M22.5 12c0 1.1-1.1 2-1.4 3-.3 1.1.1 2.5-.5 3.4-.6.9-2 .9-2.9 1.5-.9.6-1.5 1.9-2.6 2.2-1 .3-2.2-.5-3.3-.5s-2.3.8-3.3.5c-1.1-.3-1.7-1.6-2.6-2.2-.9-.6-2.3-.6-2.9-1.5-.6-.9-.2-2.3-.5-3.4-.3-1-1.4-1.9-1.4-3s1.1-2 1.4-3c.3-1.1-.1-2.5.5-3.4.6-.9 2-.9 2.9-1.5.9-.6 1.5-1.9 2.6-2.2 1-.3 2.2.5 3.3.5s2.3-.8 3.3-.5c1.1.3 1.7 1.6 2.6 2.2.9.6 2.3.6 2.9 1.5.6.9.2 2.3.5 3.4.3 1 1.4 1.9 1.4 3z"
      />
      <path
        fill="#fff"
        d="M10.3 15.3 7.7 12.7l-1.1 1.1 3.7 3.7 7.1-7.1-1.1-1.1z"
      />
    </svg>
  );
}

function GoldVerifiedBadge({ size = 19 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      style={{
        filter: "drop-shadow(0 0 5px #facc15)",
      }}
    >
      <path
        fill="#facc15"
        d="M22.5 12c0 1.1-1.1 2-1.4 3-.3 1.1.1 2.5-.5 3.4-.6.9-2 .9-2.9 1.5-.9.6-1.5 1.9-2.6 2.2-1 .3-2.2-.5-3.3-.5s-2.3.8-3.3.5c-1.1-.3-1.7-1.6-2.6-2.2-.9-.6-2.3-.6-2.9-1.5-.6-.9-.2-2.3-.5-3.4-.3-1-1.4-1.9-1.4-3s1.1-2 1.4-3c.3-1.1-.1-2.5.5-3.4.6-.9 2-.9 2.9-1.5.9-.6 1.5-1.9 2.6-2.2 1-.3 2.2.5 3.3.5s2.3-.8 3.3-.5c1.1.3 1.7 1.6 2.6 2.2.9.6 2.3.6 2.9 1.5.6.9.2 2.3.5 3.4.3 1 1.4 1.9 1.4 3z"
      />
      <path
        fill="#fff"
        d="M10.3 15.3 7.7 12.7l-1.1 1.1 3.7 3.7 7.1-7.1-1.1-1.1z"
      />
    </svg>
  );
}
function isPremiumActive(user) {
  return (
    user?.premium_plan === "silver" &&
    user?.premium_until &&
    new Date(user.premium_until).getTime() > Date.now()
  );
}

function SilverBadge({ size = 19 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-label="Premium"
      style={{
        filter:
          "drop-shadow(0 0 4px #ffffff) drop-shadow(0 0 8px #c0c0c0) drop-shadow(0 0 14px #9ca3af)",
        flexShrink: 0,
      }}
    >
      <defs>
        <linearGradient
          id="chatSilverBadgeGradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="25%" stopColor="#e5e7eb" />
          <stop offset="50%" stopColor="#9ca3af" />
          <stop offset="75%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#6b7280" />
        </linearGradient>
      </defs>

      <path
        fill="url(#chatSilverBadgeGradient)"
        stroke="#ffffff"
        strokeWidth="0.8"
        d="M22.5 12c0 1.1-1.1 2-1.4 3-.3 1.1.1 2.5-.5 3.4-.6.9-2 .9-2.9 1.5-.9.6-1.5 1.9-2.6 2.2-1 .3-2.2-.5-3.3-.5s-2.3.8-3.3.5c-1.1-.3-1.7-1.6-2.6-2.2-.9-.6-2.3-.6-2.9-1.5-.6-.9-.2-2.3-.5-3.4-.3-1-1.4-1.9-1.4-3s1.1-2 1.4-3c.3-1.1-.1-2.5.5-3.4.6-.9 2-.9 2.9-1.5.9-.6 1.5-1.9 2.6-2.2 1-.3 2.2.5 3.3.5s2.3-.8 3.3-.5c1.1.3 1.7 1.6 2.6 2.2.9.6 2.3.6 2.9 1.5.6.9.2 2.3.5 3.4.3 1 1.4 1.9 1.4 3z"
      />

      <path
        fill="#111827"
        d="M10.3 15.3 7.7 12.7l-1.1 1.1 3.7 3.7 7.1-7.1-1.1-1.1z"
      />
    </svg>
  );
}

export default function Chat() {
  const { conversationId } = useParams();

  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [typingUser, setTypingUser] = useState(false);
  const [chatUser, setChatUser] = useState(null);
  const [isDark, setIsDark] = useState(
    document.body.classList.contains("dark")
  );

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const channelRef = useRef(null);

  const token = localStorage.getItem("token");
  const currentUserId = token ? JSON.parse(atob(token.split(".")[1])).id : null;

  const authHeader = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const markSeen = async () => {
    if (!token) return;

    try {
      await api.put(`/api/messages/${conversationId}/seen`, {}, authHeader);
    } catch (err) {
      console.error(err);
    }
  };

  const loadMessages = () => {
    if (!token) return;

    api
      .get(`/api/messages/${conversationId}`, authHeader)
      .then((res) => {
        setMessages(res.data);
        markSeen();
      })
      .catch(console.error);
  };

  const loadChatUser = async () => {
    if (!token) return;

    try {
      const res = await api.get("/api/conversations", authHeader);

      const currentConversation = res.data.find(
        (item) => String(item.conversation_id) === String(conversationId)
      );

      setChatUser(currentConversation?.user || null);
    } catch (err) {
      console.error(err);
    }
  };

  const getReplyMessage = (replyId) => {
    return messages.find((msg) => String(msg.id) === String(replyId));
  };

  const sendTyping = () => {
    if (!channelRef.current || !currentUserId) return;

    channelRef.current.send({
      type: "broadcast",
      event: "typing",
      payload: {
        conversationId,
        userId: currentUserId,
      },
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setIsDark(document.body.classList.contains("dark"));
    }, 300);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadMessages();
    loadChatUser();

    const channel = supabase
      .channel(`chat-${conversationId}`, {
        config: {
          broadcast: {
            self: false,
          },
        },
      })
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          if (String(payload.new.conversation_id) === String(conversationId)) {
            setMessages((prev) => [...prev, payload.new]);
            markSeen();
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          if (String(payload.new.conversation_id) === String(conversationId)) {
            setMessages((prev) =>
              prev.map((msg) =>
                String(msg.id) === String(payload.new.id) ? payload.new : msg
              )
            );
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          setMessages((prev) =>
            prev.filter((msg) => String(msg.id) !== String(payload.old.id))
          );
        }
      )
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        if (
          String(payload.conversationId) === String(conversationId) &&
          String(payload.userId) !== String(currentUserId)
        ) {
          setTypingUser(true);

          clearTimeout(typingTimeoutRef.current);

          typingTimeoutRef.current = setTimeout(() => {
            setTypingUser(false);
          }, 1600);
        }
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      clearTimeout(typingTimeoutRef.current);
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
          reply_to_id: replyTo?.id || null,
        },
        authHeader
      );

      setContent("");
      setReplyTo(null);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteMessage = async (messageId) => {
    if (!token) {
      alert("اول وارد شوید");
      return;
    }

    if (!window.confirm("پیام برای هر دو طرف حذف شود؟")) return;

    try {
      await api.delete(`/api/messages/${messageId}`, authHeader);

      setMessages((prev) =>
        prev.filter((msg) => String(msg.id) !== String(messageId))
      );
    } catch (err) {
      console.error(err);
      alert("خطا در حذف پیام");
    }
  };

  const lastMineSeen = [...messages]
    .reverse()
    .find(
      (msg) =>
        String(msg.sender_id) === String(currentUserId) && Boolean(msg.seen_at)
    );

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: isDark ? "#111827" : "#fff",
        paddingBottom: "80px",
      }}
    >
      <div
        style={{
          padding: "14px 18px",
          borderBottom: isDark ? "1px solid #334155" : "1px solid #e5e7eb",
          position: "sticky",
          top: 0,
          background: isDark ? "#111827" : "#fff",
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
            color: isDark ? "#fff" : "#000",
            fontSize: "24px",
            fontWeight: "bold",
          }}
        >
          ←
        </Link>

        <Link
          to={
            chatUser?.username
              ? `/profile/${encodeURIComponent(chatUser.username)}`
              : "#"
          }
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
            color: "inherit",
            minWidth: 0,
          }}
        >
          <img
            src={
              chatUser?.avatar_url ||
              "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
            }
            alt=""
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              objectFit: "cover",
              flexShrink: 0,
            }}
          />

          <div
            style={{
              minWidth: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontWeight: "800",
                fontSize: "16px",
                color: isDark ? "#fff" : "#111827",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              <span
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {chatUser?.display_name || "Chat"}
              </span>

              {chatUser?.role === "admin" || chatUser?.role === "founder" ? (
                <GoldVerifiedBadge />
              ) : chatUser?.is_verified ? (
                <BlueVerifiedBadge />
              ) : null}
              {chatUser?.role !== "admin" &&
  chatUser?.role !== "founder" &&
  isPremiumActive(chatUser) && <SilverBadge size={19} />}
            </div>

            <div
              style={{
                fontSize: "13px",
                color: typingUser ? "#1d9bf0" : isDark ? "#cbd5e1" : "#64748b",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {typingUser
                ? "در حال نوشتن..."
                : chatUser?.username
                  ? `@${chatUser.username}`
                  : "Chat"}
            </div>
          </div>
        </Link>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px",
          paddingBottom: "120px",
          background: isDark ? "#2b3038" : "#f8fafc",
        }}
      >
        {messages.map((msg) => {
          const isMine = String(msg.sender_id) === String(currentUserId);
          const repliedMessage = msg.reply_to_id
            ? getReplyMessage(msg.reply_to_id)
            : null;
          const replyPreview = msg.reply_to_content || repliedMessage?.content;

          return (
            <div
              key={msg.id}
              style={{
                display: "flex",
                justifyContent: isMine ? "flex-end" : "flex-start",
                marginBottom: "12px",
              }}
            >
              <div
                style={{
                  background: isMine ? "#1d9bf0" : isDark ? "#111827" : "#fff",
                  color: isMine || isDark ? "#fff" : "#111",
                  padding: "12px 16px",
                  borderRadius: "18px",
                  maxWidth: "70%",
                  wordBreak: "break-word",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  position: "relative",
                  border: !isMine && isDark ? "1px solid #334155" : "none",
                }}
              >
                {replyPreview && (
                  <div
                    style={{
                      borderRight: `3px solid ${isMine ? "#fff" : "#1d9bf0"}`,
                      paddingRight: "8px",
                      marginBottom: "8px",
                      opacity: 0.9,
                      fontSize: "12px",
                      background: isMine
                        ? "rgba(255,255,255,0.14)"
                        : isDark
                          ? "rgba(255,255,255,0.08)"
                          : "#f1f5f9",
                      borderRadius: "10px",
                      padding: "8px",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: "700",
                        marginBottom: "3px",
                        fontSize: "11px",
                      }}
                    >
                      Reply
                    </div>
                    {replyPreview}
                  </div>
                )}

                {isMine && (
                  <button
                    onClick={() => deleteMessage(msg.id)}
                    style={{
                      border: "none",
                      background: "none",
                      color: "#fff",
                      cursor: "pointer",
                      float: "left",
                      fontSize: "14px",
                      marginRight: "8px",
                      padding: 0,
                    }}
                  >
                    🗑️
                  </button>
                )}

                <div>{msg.content}</div>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: "11px",
                    opacity: 0.75,
                    marginTop: "6px",
                  }}
                >
                  <button
                    onClick={() => setReplyTo(msg)}
                    style={{
                      border: "none",
                      background: "transparent",
                      color: isMine ? "#fff" : "#1d9bf0",
                      cursor: "pointer",
                      padding: 0,
                      fontSize: "11px",
                    }}
                  >
                    Reply
                  </button>

                  <span>
                    {msg.created_at
                      ? new Date(msg.created_at).toLocaleString("fa-IR", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </span>
                </div>

                {lastMineSeen &&
                  String(lastMineSeen.id) === String(msg.id) &&
                  isMine && (
                    <div
                      style={{
                        fontSize: "11px",
                        marginTop: "5px",
                        opacity: 0.85,
                        textAlign: "left",
                      }}
                    >
                      Seen
                    </div>
                  )}
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      <div
        style={{
          padding: "15px",
          borderTop: isDark ? "1px solid #334155" : "1px solid #e5e7eb",
          background: isDark ? "#111827" : "#fff",
          position: "sticky",
          bottom: "65px",
          zIndex: 20,
        }}
      >
        {replyTo && (
          <div
            style={{
              background: isDark ? "#1e293b" : "#eef6ff",
              borderRight: "4px solid #1d9bf0",
              padding: "10px",
              borderRadius: "12px",
              marginBottom: "10px",
              display: "flex",
              justifyContent: "space-between",
              gap: "10px",
            }}
          >
            <div
              style={{
                fontSize: "13px",
                color: isDark ? "#fff" : "#111827",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              Reply to: {replyTo.content}
            </div>

            <button
              onClick={() => setReplyTo(null)}
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontWeight: "bold",
                color: isDark ? "#fff" : "#111827",
              }}
            >
              ×
            </button>
          </div>
        )}

        <div
          style={{
            display: "flex",
            gap: "10px",
          }}
        >
          <input
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              sendTyping();
            }}
            placeholder="Write a message..."
            style={{
              flex: 1,
              padding: "14px",
              borderRadius: "999px",
              border: isDark ? "1px solid #334155" : "1px solid #d1d5db",
              outline: "none",
              background: isDark ? "#020617" : "#fff",
              color: isDark ? "#fff" : "#111827",
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
    </div>
  );
}