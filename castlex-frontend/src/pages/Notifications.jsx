import { supabase } from "../supabase";
import { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";

function isPremiumActive(user) {
  return (
    user?.premium_plan === "silver" &&
    user?.premium_until &&
    new Date(user.premium_until).getTime() > Date.now()
  );
}

function CheckBadge({ color, shadow }) {
  return (
    <svg
      viewBox="0 0 30 24"
      width="18"
      height="18"
      aria-label="badge"
      style={{
        flexShrink: 0,
        filter: shadow,
      }}
    >
      <path
        fill={color}
        d="M22.5 12c0 1.1-1.1 2-1.4 3-.3 1.1.1 2.5-.5 3.4-.6.9-2 .9-2.9 1.5-.9.6-1.5 1.9-2.6 2.2-1 .3-2.2-.5-3.3-.5s-2.3.8-3.3.5c-1.1-.3-1.7-1.6-2.6-2.2-.9-.6-2.3-.6-2.9-1.5-.6-.9-.2-2.3-.5-3.4-.3-1-1.4-1.9-1.4-3s1.1-2 1.4-3c.3-1.1-.1-2.5.5-3.4.6-.9 2-.9 2.9-1.5.9-.6 1.5-1.9 2.6-2.2 1-.3 2.2.5 3.3.5s2.3-.8 3.3-.5c1.1.3 1.7 1.6 2.6 2.2.9.6 2.3.6 2.9 1.5.6.9.2 2.3.5 3.4.3 1 1.4 1.9 1.4 3z"
      />
      <path
        fill="#fff"
        d="M10.3 15.3 7.7 12.7l-1.1 1.1 3.7 3.7 7.1-7.1-1.1-1.1z"
      />
    </svg>
  );
}

function Badge({ user }) {
  if (user?.role === "admin") {
    return (
      <CheckBadge
        color="#facc15"
        shadow="drop-shadow(0 0 6px #facc15)"
      />
    );
  }

  if (user?.is_verified) {
    return <CheckBadge color="#1d9bf0" shadow="none" />;
  }

  if (isPremiumActive(user)) {
    return (
      <CheckBadge
        color="#c0c0c0"
        shadow="drop-shadow(0 0 5px #cbd5e1)"
      />
    );
  }

  return null;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const markAllAsRead = async (token) => {
    try {
      await api.put(
        "/api/notifications/read-all",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (err) {
      console.error(err);
    }
  };

  const loadNotifications = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setNotifications([]);
      return;
    }

    try {
      setLoading(true);

      const res = await api.get("/api/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const list = Array.isArray(res.data) ? res.data : [];
      setNotifications(list);

      if (list.some((item) => item.is_read === false || item.read === false)) {
        await markAllAsRead(token);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();

    const channel = supabase
      .channel("notifications-page")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        () => {
          loadNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getText = (type) => {
    switch (type) {
      case "follow":
        return "شما را فالو کرد";

      case "like":
        return "پست شما را لایک کرد";

      case "comment":
        return "برای پست شما کامنت گذاشت";

      case "mention":
        return "شما را در یک پست تگ کرد";

      case "broadcast":
        return "پیام جدید از Castle X";

      case "premium":
        return "پریمیوم شما فعال شد";

      case "hot_request_approved":
        return "درخواست پست داغ شما تایید شد";

      case "hot_request_rejected":
        return "درخواست پست داغ شما رد شد";

      default:
        return "فعالیت جدید";
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "follow":
        return "👤";

      case "like":
        return "♥";

      case "comment":
        return "💬";

      case "mention":
        return "@";

      case "broadcast":
        return "📣";

      case "premium":
        return "✦";

      case "hot_request_approved":
        return "🔥";

      case "hot_request_rejected":
        return "!";

      default:
        return "🔔";
    }
  };

  const getTime = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleString("fa-IR", {
      timeZone: "Asia/Tehran",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getLink = (notification) => {
    if (
      (notification.type === "like" ||
        notification.type === "comment" ||
        notification.type === "mention") &&
      notification.post_id
    ) {
      return `/post/${notification.post_id}`;
    }

    if (notification.type === "follow" && notification.sender?.username) {
      return `/profile/${encodeURIComponent(notification.sender.username)}`;
    }

    return null;
  };

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "0 auto",
        minHeight: "100vh",
        padding: "20px",
        background: "#fff",
        borderLeft: "1px solid #eff3f4",
        borderRight: "1px solid #eff3f4",
      }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(12px)",
          padding: "14px 0",
          marginBottom: "14px",
          borderBottom: "1px solid #eff3f4",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                color: "#0f172a",
                fontSize: "28px",
              }}
            >
              Notifications
            </h1>

            <div
              style={{
                marginTop: "4px",
                color: "#64748b",
                fontSize: "14px",
              }}
            >
              {notifications.length} نوتیفیکیشن
            </div>
          </div>

          <button
            onClick={loadNotifications}
            disabled={loading}
            style={{
              border: "none",
              background: loading ? "#e5e7eb" : "#1d9bf0",
              color: loading ? "#64748b" : "#fff",
              padding: "9px 14px",
              borderRadius: "999px",
              fontWeight: "800",
              cursor: loading ? "default" : "pointer",
            }}
          >
            {loading ? "..." : "Refresh"}
          </button>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div
          style={{
            padding: "70px 20px",
            textAlign: "center",
            color: "#64748b",
          }}
        >
          <div style={{ fontSize: "42px", marginBottom: "10px" }}>🔔</div>

          <h3 style={{ margin: "0 0 8px", color: "#0f172a" }}>
            نوتیفیکیشنی وجود ندارد
          </h3>

          <p style={{ margin: 0 }}>
            وقتی کسی با حساب شما تعامل داشته باشد، اینجا نمایش داده می‌شود.
          </p>
        </div>
      ) : (
        notifications.map((notification) => {
          const unread =
            notification.read === false || notification.is_read === false;

          const link = getLink(notification);

          const card = (
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                background: unread ? "#eff6ff" : "#fff",
                border: unread ? "1px solid #bfdbfe" : "1px solid #eff3f4",
                borderRadius: "16px",
                padding: "14px",
                marginBottom: "12px",
                boxShadow: unread
                  ? "0 10px 25px rgba(29,155,240,0.12)"
                  : "0 2px 10px rgba(15,23,42,0.05)",
                transition: "transform 0.18s ease, box-shadow 0.18s ease",
              }}
            >
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  background: "#eef6ff",
                  color: "#1d9bf0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  fontWeight: "900",
                }}
              >
                {getIcon(notification.type)}
              </div>

              <img
                src={
                  notification.sender?.avatar_url ||
                  "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
                }
                alt=""
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  flexShrink: 0,
                }}
              />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    flexWrap: "wrap",
                  }}
                >
                  <b>
                    {notification.sender?.display_name ||
                      notification.sender?.username ||
                      "Castle X"}
                  </b>

                  <Badge user={notification.sender} />

                  {notification.sender?.username && (
                    <span
                      style={{
                        color: "#64748b",
                        fontSize: "13px",
                      }}
                    >
                      @{notification.sender.username}
                    </span>
                  )}

                  {unread && (
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: "#ef4444",
                        display: "inline-block",
                      }}
                    />
                  )}
                </div>

                <div
                  style={{
                    marginTop: "5px",
                    color: "#334155",
                    fontSize: "14px",
                    lineHeight: "1.6",
                  }}
                >
                  {getText(notification.type)}
                </div>

                {notification.message && (
                  <div
                    style={{
                      marginTop: "6px",
                      color: "#64748b",
                      fontSize: "13px",
                    }}
                  >
                    {notification.message}
                  </div>
                )}

                <div
                  style={{
                    marginTop: "7px",
                    color: "#94a3b8",
                    fontSize: "12px",
                  }}
                >
                  {getTime(notification.created_at)}
                </div>
              </div>
            </div>
          );

          if (link) {
            return (
              <Link
                key={notification.id}
                to={link}
                style={{
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                {card}
              </Link>
            );
          }

          return <div key={notification.id}>{card}</div>;
        })
      )}
    </div>
  );
}