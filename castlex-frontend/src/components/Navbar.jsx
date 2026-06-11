
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";

export default function Navbar() {
  const token = localStorage.getItem("token");
  const username =
    localStorage.getItem("username");

  const [isMobile, setIsMobile] =
    useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(
        window.innerWidth <= 768
      );
    };

    window.addEventListener(
      "resize",
      handleResize
    );

    return () =>
      window.removeEventListener(
        "resize",
        handleResize
      );
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

  if (isMobile) {
    return (
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: "65px",
          background: "#fff",
          borderTop:
            "1px solid #eff3f4",
          display: "flex",
          justifyContent:
            "space-around",
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
                textDecoration:
                  "none",
                fontSize: "24px",
              }}
            >
              ✉️
            </Link>

            <Link
              to="/notifications"
              style={{
                textDecoration:
                  "none",
                fontSize: "24px",
              }}
            >
              🔔
            </Link>

            <Link
              to={`/profile/${username}`}
              style={{
                textDecoration:
                  "none",
                fontSize: "24px",
              }}
            >
              👤
              <button
  onClick={logout}
  style={{
    border: "none",
    background: "none",
    fontSize: "24px",
    cursor: "pointer",
  }}
>
  🚪
</button>
            </Link>
          </>
        ) : (
          <>
            <Link
              to="/login"
              style={{
                textDecoration:
                  "none",
                fontSize: "24px",
              }}
            >
              🔑
            </Link>

            <Link
              to="/register"
              style={{
                textDecoration:
                  "none",
                fontSize: "24px",
              }}
            >
              📝
            </Link>
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
        background:
          "rgba(255,255,255,0.85)",
        backdropFilter:
          "blur(12px)",
        borderBottom:
          "1px solid #eff3f4",
      }}
    >
      <div
        style={{
          maxWidth: "700px",
          margin: "0 auto",
          padding: "15px 20px",
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
        }}
      >
        <Link
          to="/"
          style={{
            textDecoration:
              "none",
            color: "#000",
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
              <Link to="/messages">
                ✉️
              </Link>

              <Link to="/notifications">
                🔔
              </Link>

              <Link
                to={`/profile/${username}`}
              >
                👤
              </Link>

              <button
                onClick={logout}
                style={{
                  border: "none",
                  background:
                    "#1d9bf0",
                  color: "#fff",
                  padding:
                    "8px 18px",
                  borderRadius:
                    "9999px",
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
                  textDecoration:
                    "none",
                  fontWeight: "700",
                  color: "#1d9bf0",
                }}
              >
                Login
              </Link>

              <Link
                to="/register"
                style={{
                  textDecoration:
                    "none",
                  fontWeight: "700",
                  color: "#1d9bf0",
                }}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

