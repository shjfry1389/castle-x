import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";

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

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const logout = async () => {
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
    } catch {}

    localStorage.removeItem("token");
    localStorage.removeItem("username");

    window.location.href = "/login";
  };

  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
  };

  const themeButton = (
    <button
      onClick={toggleTheme}
      title={darkMode ? "Light mode" : "Dark mode"}
      style={{
        border: "none",
        background: "none",
        fontSize: "22px",
        cursor: "pointer",
        padding: 0,
        lineHeight: 1,
      }}
    >
      {darkMode ? "☀️" : "🌙"}
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
        <Link
          to="/"
          style={{
            textDecoration: "none",
            fontSize: "24px",
          }}
        >
          🏠
        </Link>

        <Link
          to="/search"
          style={{
            textDecoration: "none",
            fontSize: "24px",
          }}
        >
          🔍
        </Link>

        {token ? (
          <>
            <Link
              to="/messages"
              style={{
                textDecoration: "none",
                fontSize: "24px",
              }}
            >
              ✉️
            </Link>

            <Link
              to="/notifications"
              style={{
                textDecoration: "none",
                fontSize: "24px",
              }}
            >
              🔔
            </Link>

            <Link
              to={username ? `/profile/${username}` : "/login"}
              style={{
                textDecoration: "none",
                fontSize: "24px",
              }}
            >
              👤
            </Link>

            {themeButton}

            <button
              onClick={logout}
              style={{
                border: "none",
                background: "none",
                fontSize: "22px",
                cursor: "pointer",
                marginLeft: "8px",
              }}
            >
              🚪
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              style={{
                textDecoration: "none",
                fontSize: "24px",
              }}
            >
              🔑
            </Link>

            <Link
              to="/register"
              style={{
                textDecoration: "none",
                fontSize: "24px",
              }}
            >
              📝
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
            color: darkMode ? "#f8fafc" : "#000",
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
            gap: "18px",
          }}
        >
          <Link to="/">🏠</Link>
          <Link to="/search">🔍</Link>

          {token ? (
            <>
              <Link to="/messages">✉️</Link>

              <Link to="/notifications">🔔</Link>

              <Link to={username ? `/profile/${username}` : "/login"}>👤</Link>

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