import { Link } from "react-router-dom";
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

export default function Navbar({ darkMode, setDarkMode }) {
  const token = localStorage.getItem("token");
  let username = localStorage.getItem("username");

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

  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const loadUnreadNotifications = async () => {
  try {
    const currentToken = localStorage.getItem("token");

    if (!currentToken) return;

    const res = await api.get("/api/notifications/unread-count", {
      headers: {
        Authorization: `Bearer ${currentToken}`,
      },
    });

    setUnreadNotifications(res.data.count || 0);
  } catch (err) {
    console.error(err);
  }
};
const loadUnreadMessages = async () => {
  try {
    const currentToken = localStorage.getItem("token");

    if (!currentToken) return;

    const res = await api.get("/api/messages/unread-count", {
      headers: {
        Authorization: `Bearer ${currentToken}`,
      },
    });

    setUnreadMessages(res.data.count || 0);
  } catch (err) {
    console.error(err);
  }
};

useEffect(() => {
  if (!token) return;

  loadUnreadNotifications();
  loadUnreadMessages();

  const channel = supabase
    .channel("navbar-unread-status")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
      },
      () => {
        loadUnreadNotifications();
      }
    )
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "notifications",
      },
      () => {
        loadUnreadNotifications();
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
        loadUnreadMessages();
      }
    )
    .subscribe();

  const refreshOnFocus = () => {
    loadUnreadNotifications();
    loadUnreadMessages();
  };

  window.addEventListener("focus", refreshOnFocus);

  return () => {
    window.removeEventListener("focus", refreshOnFocus);
    supabase.removeChannel(channel);
  };
}, [token]);

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
  };

  const iconButtonStyle = {
    ...iconLinkStyle,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    padding: 0,
  };
  const NotificationDot = () => {
  if (unreadNotifications <= 0) return null;

  return (
    <span
      style={{
        position: "absolute",
        top: "2px",
        right: "2px",
        minWidth: "16px",
        height: "16px",
        padding: "0 4px",
        borderRadius: "999px",
        background: "#ef4444",
        color: "#fff",
        fontSize: "10px",
        fontWeight: "900",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 0 0 2px #fff",
      }}
    >
      {unreadNotifications > 9 ? "9+" : unreadNotifications}
    </span>
  );
};
const MessageDot = () => {
  if (unreadMessages <= 0) return null;

  return (
    <span
      style={{
        position: "absolute",
        top: "2px",
        right: "2px",
        minWidth: "16px",
        height: "16px",
        padding: "0 4px",
        borderRadius: "999px",
        background: "#ef4444",
        color: "#fff",
        fontSize: "10px",
        fontWeight: "900",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 0 0 2px #fff",
      }}
    >
      {unreadMessages > 9 ? "9+" : unreadMessages}
    </span>
  );
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
const RankingsIcon = () => (
  <Icon color={iconColor}>
    <path d="M8 21h8" />
    <path d="M12 17v4" />
    <path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" />
    <path d="M5 5H3v2a4 4 0 0 0 4 4" />
    <path d="M19 5h2v2a4 4 0 0 1-4 4" />
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
        <Link
  to="/hashtags"
  title="Hashtags"
  style={{
    textDecoration: "none",
    color: "inherit",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "34px",
    height: "34px",
    fontSize: "28px",
    fontWeight: "950",
    lineHeight: 1,
  }}
>
  #
</Link>
<Link to="/rankings" title="Rankings" style={iconLinkStyle}>
  <RankingsIcon />
</Link>

        {token ? (
          <>
<Link
  to="/messages"
  style={{
    ...iconLinkStyle,
    position: "relative",
  }}
>
  <MessagesIcon />
  <MessageDot />
</Link>
            <Link
  to="/notifications"
  style={{
    ...iconLinkStyle,
    position: "relative",
  }}
>
  <BellIcon />
  <NotificationDot />
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
          <Link
  to="/hashtags"
  title="Hashtags"
  style={{
    textDecoration: "none",
    color: "inherit",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "34px",
    height: "34px",
    fontSize: "28px",
    fontWeight: "950",
    lineHeight: 1,
  }}
>
  #
</Link>
<Link to="/rankings" title="Rankings" style={iconLinkStyle}>
  <RankingsIcon />
</Link>

          {token ? (
            <>
<Link
  to="/messages"
  style={{
    ...iconLinkStyle,
    position: "relative",
  }}
>
  <MessagesIcon />
  <MessageDot />
</Link>

<Link
  to="/notifications"
  style={{
    ...iconLinkStyle,
    position: "relative",
  }}
>
  <BellIcon />
  <NotificationDot />
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