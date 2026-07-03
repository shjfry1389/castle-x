import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";
import { supabase } from "../supabase";

function Icon({ children, color }) {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

function NotificationDot({ borderColor }) {
  return (
    <span
      style={{
        position: "absolute",
        top: "5px",
        right: "5px",
        width: "10px",
        height: "10px",
        borderRadius: "50%",
        background: "#ef4444",
        border: `2px solid ${borderColor}`,
        boxShadow: "0 0 0 2px rgba(239,68,68,0.15)",
      }}
    />
  );
}

export default function Navbar({ darkMode, setDarkMode }) {
  const location = useLocation();
  const token = localStorage.getItem("token");
  let username = localStorage.getItem("username");
  let currentUserId = null;

  if (!username && token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      username = payload.username || payload.user?.username;

      if (username) {
        localStorage.setItem("username", username);
      }
    } catch (err) {
      console.error(err);
    }
  }

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      currentUserId = payload.id || payload.user?.id;
    } catch (err) {
      console.error(err);
    }
  }

  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);
  const [hasNewMessage, setHasNewMessage] = useState(
    () => localStorage.getItem("castle_x_has_new_message") === "true"
  );
  const [hasNewNotification, setHasNewNotification] = useState(
    () => localStorage.getItem("castle_x_has_new_notification") === "true"
  );

  const setMessageBadge = (value) => {
    setHasNewMessage(value);
    localStorage.setItem("castle_x_has_new_message", value ? "true" : "false");
  };

  const setNotificationBadge = (value) => {
    setHasNewNotification(value);
    localStorage.setItem(
      "castle_x_has_new_notification",
      value ? "true" : "false"
    );
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!token || !currentUserId) return;

    const messagesChannel = supabase
      .channel(`navbar-messages-${currentUserId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const message = payload.new;

          if (String(message.sender_id) !== String(currentUserId)) {
            setMessageBadge(true);
          }
        }
      )
      .subscribe();

    const notificationsChannel = supabase
      .channel(`navbar-notifications-${currentUserId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          const notification = payload.new;

          const notificationUserId =
            notification.user_id ||
            notification.receiver_id ||
            notification.to_user_id ||
            notification.target_user_id;

          if (String(notificationUserId) === String(currentUserId)) {
            setNotificationBadge(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(notificationsChannel);
    };
  }, [token, currentUserId]);

  useEffect(() => {
    if (
      location.pathname.startsWith("/messages") ||
      location.pathname.startsWith("/chat")
    ) {
      setMessageBadge(false);
    }

    if (location.pathname.startsWith("/notifications")) {
      setNotificationBadge(false);
    }
  }, [location.pathname]);

  const logout = async () => {
    const confirmLogout = window.confirm(
      "آیا مطمئنید می‌خواهید از حساب کاربری خود خارج شوید؟"
    );

    if (!confirmLogout) return;

    try {
      await api.put(
        "/api/users/offline",
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

    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");

    window.location.href = "/login";
  };

  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
  };

  const iconColor = darkMode ? "#f8fafc" : "#111827";

  const iconLinkStyle = {
    width: "38px",
    height: "38px",
    borderRadius: "999px",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: iconColor,
    transition: "background 0.2s ease, transform 0.2s ease",
    position: "relative",
  };

  const iconButtonStyle = {
    ...iconLinkStyle,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    padding: 0,
  };

  const HomeIcon = () => (
    <Icon color={iconColor}>
      <path d="M3 11.5L12 4l9 7.5" />
      <path d="M5 10.5V20h5v-6h4v6h5v-9.5" />
    </Icon>
  );

  const SearchIcon = () => (
    <Icon color={iconColor}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-4.5-4.5" />
    </Icon>
  );

  const MessagesIcon = () => (
    <Icon color={iconColor}>
      <path d="M4 6.5A3.5 3.5 0 0 1 7.5 3h9A3.5 3.5 0 0 1 20 6.5v6A3.5 3.5 0 0 1 16.5 16H10l-5 4v-4.5A3.5 3.5 0 0 1 4 12.5z" />
      <path d="M8 9h8" />
      <path d="M8 12h5" />
    </Icon>
  );

  const BellIcon = () => (
    <Icon color={iconColor}>
      <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21a2.5 2.5 0 0 0 4 0" />
    </Icon>
  );

  const ProfileIcon = () => (
    <Icon color={iconColor}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </Icon>
  );

  const MoonIcon = () => (
    <Icon color={iconColor}>
      <path d="M21 14.5A8.5 8.5 0 0 1 9.5 3a7 7 0 1 0 11.5 11.5z" />
    </Icon>
  );

  const SunIcon = () => (
    <Icon color={iconColor}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="M4.93 4.93l1.41 1.41" />
      <path d="M17.66 17.66l1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="M4.93 19.07l1.41-1.41" />
      <path d="M17.66 6.34l1.41-1.41" />
    </Icon>
  );

  const LogoutIcon = () => (
    <Icon color={iconColor}>
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
      <path d="M14 4h4a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-4" />
    </Icon>
  );

  const dotBorderColor = darkMode ? "#0f172a" : "#fff";

  const themeButton = (
    <button
      onClick={toggleTheme}
      title={darkMode ? "Light mode" : "Dark mode"}
      style={iconButtonStyle}
    >
      {darkMode ? <SunIcon /> : <MoonIcon />}
    </button>
  );

  if (isMobile) {
    return (
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: "65px",
          background: darkMode ? "#0f172a" : "#fff",
          borderTop: darkMode ? "1px solid #334155" : "1px solid #eff3f4",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          zIndex: 9999,
        }}
      >
        <Link to="/" style={iconLinkStyle}>
          <HomeIcon />
        </Link>

        <Link to="/search" style={iconLinkStyle}>
          <SearchIcon />
        </Link>

        {token ? (
          <>
            <Link to="/messages" style={iconLinkStyle}>
              <MessagesIcon />
              {hasNewMessage && <NotificationDot borderColor={dotBorderColor} />}
            </Link>

            <Link to="/notifications" style={iconLinkStyle}>
              <BellIcon />
              {hasNewNotification && (
                <NotificationDot borderColor={dotBorderColor} />
              )}
            </Link>

            <Link
              to={username ? `/profile/${encodeURIComponent(username)}` : "/login"}
              style={iconLinkStyle}
            >
              <ProfileIcon />
            </Link>

            {themeButton}

            <button onClick={logout} title="Logout" style={iconButtonStyle}>
              <LogoutIcon />
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              style={{
                textDecoration: "none",
                fontWeight: "700",
                color: "#1d9bf0",
              }}
            >
              Login
            </Link>

            <Link
              to="/register"
              style={{
                textDecoration: "none",
                fontWeight: "700",
                color: "#1d9bf0",
              }}
            >
              Register
            </Link>

            {themeButton}
          </>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 999,
        background: darkMode ? "rgba(15,23,42,0.88)" : "rgba(255,255,255,0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: darkMode ? "1px solid #334155" : "1px solid #eff3f4",
      }}
    >
      <div
        style={{
          maxWidth: "700px",
          margin: "0 auto",
          padding: "15px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Link
          to="/"
          style={{
            textDecoration: "none",
            color: iconColor,
            fontWeight: "800",
            fontSize: "24px",
          }}
        >
          Castle X
        </Link>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <Link to="/" style={iconLinkStyle}>
            <HomeIcon />
          </Link>

          <Link to="/search" style={iconLinkStyle}>
            <SearchIcon />
          </Link>

          {token ? (
            <>
              <Link to="/messages" style={iconLinkStyle}>
                <MessagesIcon />
                {hasNewMessage && (
                  <NotificationDot borderColor={dotBorderColor} />
                )}
              </Link>

              <Link to="/notifications" style={iconLinkStyle}>
                <BellIcon />
                {hasNewNotification && (
                  <NotificationDot borderColor={dotBorderColor} />
                )}
              </Link>

              <Link
                to={username ? `/profile/${encodeURIComponent(username)}` : "/login"}
                style={iconLinkStyle}
              >
                <ProfileIcon />
              </Link>

              {themeButton}

              <button
                onClick={logout}
                style={{
                  border: "none",
                  background: "#1d9bf0",
                  color: "#fff",
                  padding: "8px 18px",
                  borderRadius: "9999px",
                  cursor: "pointer",
                  fontWeight: "700",
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                style={{
                  textDecoration: "none",
                  fontWeight: "700",
                  color: "#1d9bf0",
                }}
              >
                Login
              </Link>

              <Link
                to="/register"
                style={{
                  textDecoration: "none",
                  fontWeight: "700",
                  color: "#1d9bf0",
                }}
              >
                Register
              </Link>

              {themeButton}
            </>
          )}
        </div>
      </div>
    </div>
  );
}