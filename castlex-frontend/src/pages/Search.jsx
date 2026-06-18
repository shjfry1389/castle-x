import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../services/api";

export default function Search() {
const [query, setQuery] = useState("");
const [users, setUsers] = useState([]);

const navigate = useNavigate();

const searchUsers = async () => {
try {
if (!query.trim()) return;


  const res = await api.get(
    `/api/search/users?q=${query}`
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
🏠 Home </button>


    <h2
      style={{
        marginBottom: "15px",
      }}
    >
      🔍 Explore
    </h2>

    <input
      value={query}
      onChange={(e) =>
        setQuery(e.target.value)
      }
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
      <p>
        Find users by username
      </p>
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
            borderBottom:
              "1px solid #eff3f4",
            transition: "0.2s",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background =
              "#f7f9f9";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background =
              "#fff";
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
              <b>
                {user.display_name ||
                  user.username}
              </b>

              {user.is_verified && (
                <span>🔵</span>
              )}

              {user.role === "admin" && (
                <span>🟡</span>
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
