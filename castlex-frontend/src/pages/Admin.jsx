import { useEffect, useState } from "react";
import { SpeedInsights } from "@vercel/speed-insights/next"
import api from "../services/api";
import { Link } from "react-router-dom";

export default function Admin() {
    const isMobile = window.innerWidth <= 768;
const [users, setUsers] = useState([]);
const [reports, setReports] =
  useState([]);
const [posts, setPosts] = useState([]);
const [comments, setComments] =
  useState([]);
const [stats, setStats] = useState({
users: 0,
posts: 0,
comments: 0,
likes: 0,
});

useEffect(() => {
  loadUsers();
  loadStats();
  loadPosts();
  loadComments();
  loadReports();
}, []);
const loadReports = async () => {
  try {
    const token =
      localStorage.getItem("token");

    const res = await api.get(
      "/api/admin/reports",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setReports(res.data);
  } catch (err) {
    console.error(err);
  }
};
const loadPosts = async () => {
  try {
    const token =
      localStorage.getItem("token");

    const res = await api.get(
      "/api/admin/posts",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setPosts(res.data);
  } catch (err) {
    console.error(err);
  }
};


const loadUsers = async () => {
try {
const token = localStorage.getItem("token");


  const res = await api.get(
    "/api/admin/users",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  setUsers(res.data);
} catch (err) {
  console.error(err);
}


};

const loadStats = async () => {
try {
const token = localStorage.getItem("token");


  const res = await api.get(
    "/api/admin/stats",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  setStats(res.data);
} catch (err) {
  console.error(err);
}


};
const loadComments = async () => {
  try {
    const token =
      localStorage.getItem("token");

    const res = await api.get(
      "/api/admin/comments",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setComments(res.data);
  } catch (err) {
    console.error(err);
  }
};const deleteComment = async (id) => {
  try {
    const token =
      localStorage.getItem("token");

    await api.delete(
      `/api/admin/comment/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setComments((prev) =>
      prev.filter(
        (c) => c.id !== id
      )
    );
  } catch (err) {
    console.error(err);
  }
};
const deleteReport = async (id) => {
  try {
    const token =
      localStorage.getItem("token");

    await api.delete(
      `/api/admin/report/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setReports((prev) =>
      prev.filter(
        (r) => r.id !== id
      )
    );
  } catch (err) {
    console.error(err);
  }
};
const toggleVerify = async (user) => {
try {
const token = localStorage.getItem("token");


  const endpoint =
    user.is_verified
      ? `/api/admin/unverify/${user.id}`
      : `/api/admin/verify/${user.id}`;

  await api.put(
    endpoint,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  setUsers((prev) =>
    prev.map((u) =>
      u.id === user.id
        ? {
            ...u,
            is_verified: !u.is_verified,
          }
        : u
    )
  );
} catch (err) {
  console.error(err);
  alert("خطا در انجام عملیات");
}


};

const toggleAdmin = async (user) => {
try {
const token = localStorage.getItem("token");


  const endpoint =
    user.role === "admin"
      ? `/api/admin/remove-admin/${user.id}`
      : `/api/admin/make-admin/${user.id}`;

  await api.put(
    endpoint,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  setUsers((prev) =>
    prev.map((u) =>
      u.id === user.id
        ? {
            ...u,
            role:
              u.role === "admin"
                ? "user"
                : "admin",
          }
        : u
    )
  );
} catch (err) {
  console.error(err);
  alert("خطا در تغییر نقش");
}


};

const toggleBan = async (user) => {
try {
const token = localStorage.getItem("token");


  const endpoint = user.banned
    ? `/api/admin/unban/${user.id}`
    : `/api/admin/ban/${user.id}`;

  await api.put(
    endpoint,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  setUsers((prev) =>
    prev.map((u) =>
      u.id === user.id
        ? {
            ...u,
            banned: !u.banned,
          }
        : u
    )
  );
} catch (err) {
  console.error(err);
  alert("خطا در بن کردن کاربر");
}


};

const deleteUser = async (id) => {
try {
const token = localStorage.getItem("token");


  if (
    !window.confirm(
      "کاربر حذف شود؟"
    )
  ) {
    return;
  }

  await api.delete(
    `/api/admin/user/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  setUsers((prev) =>
    prev.filter(
      (u) => u.id !== id
    )
  );

  loadStats();
} catch (err) {
  console.error(err);
  alert("خطا در حذف کاربر");
}


};
const deletePost = async (id) => {
  try {
    const token =
      localStorage.getItem("token");

    if (
      !window.confirm(
        "پست حذف شود؟"
      )
    ) {
      return;
    }

    await api.delete(
      `/api/admin/post/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setPosts((prev) =>
      prev.filter(
        (p) => p.id !== id
      )
    );

    loadStats();
  } catch (err) {
    console.error(err);
    alert("خطا در حذف پست");
  }
};
const statCard = (background) => ({
  background,
  color: "#fff",
  padding: "20px",
  borderRadius: "15px",
});

const boxStyle = {
  border: "1px solid #ddd",
  borderRadius: "12px",
  padding: "15px",
  marginBottom: "10px",
};

const dangerButton = {
  background: "#ef4444",
  color: "#fff",
  border: "none",
  padding: "8px 14px",
  borderRadius: "8px",
  cursor: "pointer",
};

return (
<div
  style={{
    maxWidth: "1200px",
    margin: "0 auto",
    padding: isMobile ? "10px" : "30px",
  }}
>
    <Link
  to="/"
  style={{
    display: "inline-block",
    marginBottom: "15px",
    textDecoration: "none",
    color: "#1d9bf0",
    fontWeight: "700",
    fontSize: "18px",
  }}
>
  ← Back to Home
</Link>
    <h1>Castle X Admin Panel</h1>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
        gap: "20px",
        marginTop: "30px",
        marginBottom: "40px",
      }}
    >
      <div style={statCard("#1d9bf0")}>
        <h2>{stats.users}</h2>
        <p>Users</p>
      </div>

      <div style={statCard("#22c55e")}>
        <h2>{stats.posts}</h2>
        <p>Posts</p>
      </div>

      <div style={statCard("#f59e0b")}>
        <h2>{stats.comments}</h2>
        <p>Comments</p>
      </div>

      <div style={statCard("#ef4444")}>
        <h2>{stats.likes}</h2>
        <p>Likes</p>
      </div>
    </div>

    <h2>Reports</h2>
    {reports.length === 0 && (
  <p>No Reports</p>
)}

    {reports.map((report) => (
      <div key={report.id} style={boxStyle}>
        <p>Report ID: {report.id}</p>
        <p>Reporter: {report.reporter_id}</p>
        <p>Target User: {report.target_user_id}</p>
        <p>Reason: {report.reason}</p>

        <button onClick={() => deleteReport(report.id)} style={dangerButton}>
          Delete Report
        </button>
      </div>
    ))}

    <h2 style={{ marginTop: "50px" }}>Users</h2>
    <div
  style={{
    overflowX: isMobile ? "auto" : "visible",
  }}
></div>
    <table
  style={{
    width: "100%",
    minWidth: isMobile ? "400px" : "100%",
    borderCollapse: "collapse",
  }}
>
      <thead>
        <tr>
          <th>ID</th>
          <th>Username</th>
          <th>Name</th>
          <th>Verified</th>
          <th>Banned</th>
          <th>Role</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        {users.map((user) => (
            <tr
  key={user.id}
  style={{
    borderBottom: "1px solid #ddd",
    backgroundColor: user.banned
      ? "#ffe5e5"
      : "transparent",
  }}
>
            <td>{user.id}</td>
            <td>@{user.username}</td>
            <td>{user.display_name}</td>
            <td>{user.is_verified ? "✅" : "❌"}</td>
            <td>{user.banned ? "🚫" : "✅"}</td>
            <td>
  {user.display_name}
  {user.role === "admin" && " 👑"}
</td>

<td
  style={{
    display: "flex",
    gap: "8px",
    padding: "8px",
    flexWrap: isMobile ? "wrap" : "nowrap",
  }}
>
              <button onClick={() => toggleVerify(user)}>
                {user.is_verified ? "Unverify" : "Verify"}
              </button>

              <button onClick={() => toggleAdmin(user)}>
                {user.role === "admin" ? "Remove Admin" : "Make Admin"}
              </button>

              <button onClick={() => toggleBan(user)}>
                {user.banned ? "Unban" : "Ban"}
              </button>

              <button onClick={() => deleteUser(user.id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    <h2 style={{ marginTop: "50px" }}>Posts</h2>

    {posts.map((post) => (
      <div key={post.id} style={boxStyle}>
        <div>
          <b>{post.author?.display_name}</b> @{post.author?.username}
        </div>

        <p>{post.content}</p>

        <button onClick={() => deletePost(post.id)} style={dangerButton}>
          Delete Post
        </button>
      </div>
    ))}

    <h2 style={{ marginTop: "50px" }}>Comments</h2>

    {comments.map((comment) => (
      <div key={comment.id} style={boxStyle}>
        <p>{comment.content}</p>

        <button onClick={() => deleteComment(comment.id)} style={dangerButton}>
          Delete Comment
        </button>
      </div>
    ))}
  </div>
);
}