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

  const getIcon = (lightIcon, darkIcon) => {
    return darkMode ? `/icons/${darkIcon}?v=3` : `/icons/${lightIcon}?v=3`;
  };

  const iconStyle = {
    width: "28px",
    height: "28px",
    objectFit: "contain",
    display: "block",
  };

  const iconLinkStyle = {
    width: "34px",
    height: "34px",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: darkMode ? "#f8fafc" : "#111827",
    fontSize: "22px",
    overflow: "hidden",
  };

  function NavIcon({ light, dark, alt, fallback }) {
    const [failed, setFailed] = useState(false);

    if (failed) {
      return (
        <span
          aria-label={alt}
          title={alt}
          style={{
            lineHeight: 1,
            fontSize: "22px",
          }}
        >
          {fallback}
        </span>
      );
    }

    return (
      <img
        src={getIcon(light, dark)}
        alt={alt}
        title={alt}
        style={iconStyle}
        onError={() => setFailed(true)}
      />
    );
  }

  const themeButton = (
    <button
      onClick={toggleTheme}
      title={darkMode ? "Light mode" : "Dark mode"}
      style={{
        ...iconLinkStyle,
        border: "none",
        background: "none",
        cursor: "pointer",
        padding: 0,
      }}
    >
      <img
        src={darkMode ? "/icons/sun.png?v=3" : "/icons/moon.png?v=3"}
        alt="Theme"
        style={iconStyle}
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
    </button>
  );

  const homeIcon = (
    <NavIcon
      light="home-light.png"
      dark="home-dark.png"
      alt="Home"
      fallback="🏠"
    />
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
          {homeIcon}
        </Link>

        <Link to="/search" style={iconLinkStyle}>
          <NavIcon
            light="search-light.png"
            dark="search-dark.png"
            alt="Search"
            fallback="🔍"
          />
        </Link>

        {token ? (
          <>
            <Link to="/messages" style={iconLinkStyle}>
              <NavIcon
                light="messages-light.png"
                dark="messages-dark.png"
                alt="Messages"
                fallback="✉️"
              />
            </Link>

            <Link to="/notifications" style={iconLinkStyle}>
              <NavIcon
                light="bell-light.png"
                dark="bell-dark.png"
                alt="Notifications"
                fallback="🔔"
              />
            </Link>

            <Link
              to={username ? `/profile/${encodeURIComponent(username)}` : "/login"}
              style={iconLinkStyle}
            >
              <NavIcon
                light="profile-light.png"
                dark="profile-dark.png"
                alt="Profile"
                fallback="👤"
              />
            </Link>

            {themeButton}

            <button
              onClick={logout}
              title="Logout"
              style={{
                ...iconLinkStyle,
                border: "none",
                background: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              <NavIcon
                light="logout-light.png"
                dark="logout-dark.png"
                alt="Logout"
                fallback="🚪"
              />
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
          <Link to="/" style={iconLinkStyle}>
            {homeIcon}
          </Link>

          <Link to="/search" style={iconLinkStyle}>
            <NavIcon
              light="search-light.png"
              dark="search-dark.png"
              alt="Search"
              fallback="🔍"
            />
          </Link>

          {token ? (
            <>
              <Link to="/messages" style={iconLinkStyle}>
                <NavIcon
                  light="messages-light.png"
                  dark="messages-dark.png"
                  alt="Messages"
                  fallback="✉️"
                />
              </Link>

              <Link to="/notifications" style={iconLinkStyle}>
                <NavIcon
                  light="bell-light.png"
                  dark="bell-dark.png"
                  alt="Notifications"
                  fallback="🔔"
                />
              </Link>

              <Link
                to={username ? `/profile/${encodeURIComponent(username)}` : "/login"}
                style={iconLinkStyle}
              >
                <NavIcon
                  light="profile-light.png"
                  dark="profile-dark.png"
                  alt="Profile"
                  fallback="👤"
                />
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