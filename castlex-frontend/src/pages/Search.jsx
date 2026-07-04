import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../services/api";

function BlueVerifiedBadge({ size = 20 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      style={{
        marginLeft: "4px",
        verticalAlign: "middle",
        flexShrink: 0,
      }}
    >
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

function GoldVerifiedBadge({ size = 20 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      style={{
        marginLeft: "4px",
        verticalAlign: "middle",
        flexShrink: 0,
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

function SilverBadge({ size = 20 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size}>
      <path
        fill="#c0c0c0"
        stroke="#ffffff"
        strokeWidth="0.8"
        style={{
          filter:
            "drop-shadow(0 0 4px #ffffff) drop-shadow(0 0 8px #9ca3af)",
        }}
        d="M22.5 12c0 1.1-1.1 2-1.4 3-.3 1.1.1 2.5-.5 3.4-.6.9-2 .9-2.9 1.5-.9.6-1.5 1.9-2.6 2.2-1 .3-2.2-.5-3.3-.5s-2.3.8-3.3.5c-1.1-.3-1.7-1.6-2.6-2.2-.9-.6-2.3-.6-2.9-1.5-.6-.9-.2-2.3-.5-3.4-.3-1-1.4-1.9-1.4-3s1.1-2 1.4-3c.3-1.1-.1-2.5.5-3.4.6-.9 2-.9 2.9-1.5.9-.6 1.5-1.9 2.6-2.2 1-.3 2.2.5 3.3.5s2.3-.8 3.3-.5c1.1.3 1.7 1.6 2.6 2.2.9.6 2.3.6 2.9 1.5.6.9.2 2.3.5 3.4.3 1 1.4 1.9 1.4 3z"
      />
      <path
        fill="#111827"
        d="M10.3 15.3 7.7 12.7l-1.1 1.1 3.7 3.7 7.1-7.1-1.1-1.1z"
      />
    </svg>
  );
}
export default function Search() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);

  const navigate = useNavigate();

  const searchUsers = async () => {
    try {
      if (!query.trim()) return;

      const res = await api.get(
        `/api/search/users?q=${encodeURIComponent(query.trim())}`
      );

      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

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
          padding: "15px",
          borderBottom: "1px solid #eff3f4",
          zIndex: 10,
        }}
      >
        <button
          onClick={() => navigate("/")}
          style={{
            border: "none",
            background: "#1d9bf0",
            color: "#fff",
            padding: "10px 18px",
            borderRadius: "999px",
            cursor: "pointer",
            fontWeight: "bold",
            marginBottom: "15px",
          }}
        >
          🏠 Home
        </button>

        <h2
          style={{
            marginBottom: "15px",
          }}
        >
          🔍 Explore
        </h2>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              searchUsers();
            }
          }}
          placeholder="Search users..."
          style={{
            width: "100%",
            padding: "12px 18px",
            borderRadius: "9999px",
            border: "1px solid #ddd",
            outline: "none",
            fontSize: "15px",
          }}
        />
      </div>

      {users.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "#536471",
          }}
        >
          <h3>Search for people</h3>
          <p>Find users by username</p>
        </div>
      ) : (
        users.map((user) => (
          <Link
            key={user.id}
            to={`/profile/${encodeURIComponent(user.username || "")}`}
            style={{
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "12px",
                padding: "16px",
                borderBottom: "1px solid #eff3f4",
                transition: "0.2s",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f7f9f9";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#fff";
              }}
            >
              <img
                src={
                  user.avatar_url ||
                  "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
                }
                alt=""
                style={{
                  width: "55px",
                  height: "55px",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />

              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  <b>{user.display_name || user.username}</b>

                  {user.role === "admin" ? (
                    <GoldVerifiedBadge size={20} />
                  ) : user.is_verified ? (
                    <BlueVerifiedBadge size={20} />
                  ) : null}
                  {user.role !== "admin" && isPremiumActive(user) && (
  <SilverBadge size={20} />
)}
                </div>

                <div
                  style={{
                    color: "#536471",
                    fontSize: "14px",
                  }}
                >
                  @{user.username}
                </div>

                {user.bio && (
                  <div
                    style={{
                      marginTop: "5px",
                      fontSize: "14px",
                    }}
                  >
                    {user.bio}
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}