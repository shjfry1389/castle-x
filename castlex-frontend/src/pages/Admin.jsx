import { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";

export default function Admin() {
  const isMobile = window.innerWidth <= 768;

  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [search, setSearch] = useState("");

  const [editingUser, setEditingUser] = useState(null);
  const [editUsername, setEditUsername] = useState("");
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [adminEditSecret, setAdminEditSecret] = useState("");

  const [stats, setStats] = useState({
    users: 0,
    posts: 0,
    comments: 0,
    likes: 0,
  });

  const token = localStorage.getItem("token");

  const authHeader = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  useEffect(() => {
    loadUsers();
    loadStats();
    loadPosts();
    loadComments();
    loadReports();
  }, []);

  const matchesSearch = (...values) => {
    const q = search.trim().toLowerCase();

    if (!q) return true;

    return values
      .filter((value) => value !== null && value !== undefined)
      .some((value) => String(value).toLowerCase().includes(q));
  };

  const filteredReports = reports.filter((report) =>
    matchesSearch(
      report.id,
      report.reporter_id,
      report.target_user_id,
      report.reason,
      report.post_id
    )
  );

  const filteredUsers = users.filter((user) =>
    matchesSearch(
      user.id,
      user.username,
      user.display_name,
      user.role,
      user.banned ? "banned" : "active",
      user.is_verified ? "verified" : "unverified"
    )
  );

  const filteredPosts = posts.filter((post) =>
    matchesSearch(
      post.id,
      post.content,
      post.author?.username,
      post.author?.display_name,
      post.user_id
    )
  );

  const filteredComments = comments.filter((comment) =>
    matchesSearch(comment.id, comment.content, comment.user_id, comment.post_id)
  );

  const loadReports = async () => {
    try {
      const res = await api.get("/api/admin/reports", authHeader);
      setReports(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadPosts = async () => {
    try {
      const res = await api.get("/api/admin/posts", authHeader);
      setPosts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await api.get("/api/admin/users", authHeader);
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadStats = async () => {
    try {
      const res = await api.get("/api/admin/stats", authHeader);
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadComments = async () => {
    try {
      const res = await api.get("/api/admin/comments", authHeader);
      setComments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const openEditUser = (user) => {
    setEditingUser(user);
    setEditUsername(user.username || "");
    setEditDisplayName(user.display_name || "");
    setEditPassword("");
    setAdminEditSecret("");
  };

  const closeEditUser = () => {
    setEditingUser(null);
    setEditPassword("");
    setAdminEditSecret("");
  };

  const saveUserAccount = async () => {
    try {
      if (!editingUser) return;

      if (!adminEditSecret.trim()) {
        alert("رمز مخصوص ویرایش ادمین را وارد کن");
        return;
      }

      const res = await api.put(
        `/api/admin/users/${editingUser.id}/account`,
        {
          username: editUsername,
          display_name: editDisplayName,
          password: editPassword,
          admin_edit_secret: adminEditSecret.trim(),
        },
        authHeader
      );

      setUsers((prev) =>
        prev.map((user) =>
          user.id === editingUser.id
            ? {
                ...user,
                ...res.data.user,
              }
            : user
        )
      );

      closeEditUser();
      alert("اطلاعات کاربر تغییر کرد");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "خطا در تغییر اطلاعات کاربر");
    }
  };

  const deleteComment = async (id) => {
    try {
      await api.delete(`/api/admin/comment/${id}`, authHeader);
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteReport = async (id) => {
    try {
      await api.delete(`/api/admin/report/${id}`, authHeader);
      setReports((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleVerify = async (user) => {
    try {
      const endpoint = user.is_verified
        ? `/api/admin/unverify/${user.id}`
        : `/api/admin/verify/${user.id}`;

      await api.put(endpoint, {}, authHeader);

      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, is_verified: !u.is_verified } : u
        )
      );
    } catch (err) {
      console.error(err);
      alert("خطا در انجام عملیات");
    }
  };

  const toggleAdmin = async (user) => {
    try {
      const endpoint =
        user.role === "admin"
          ? `/api/admin/remove-admin/${user.id}`
          : `/api/admin/make-admin/${user.id}`;

      await api.put(endpoint, {}, authHeader);

      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? { ...u, role: u.role === "admin" ? "user" : "admin" }
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
      const endpoint = user.banned
        ? `/api/admin/unban/${user.id}`
        : `/api/admin/ban/${user.id}`;

      await api.put(endpoint, {}, authHeader);

      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, banned: !u.banned } : u))
      );
    } catch (err) {
      console.error(err);
      alert("خطا در بن کردن کاربر");
    }
  };

  const deleteUser = async (id) => {
  try {
    const confirmDelete = window.confirm(
      "آیا مطمئنید می‌خواهید این کاربر را حذف کنید؟ این عملیات قابل برگشت نیست."
    );

    if (!confirmDelete) return;

    const secret = window.prompt("رمز محرمانه ادمین را وارد کنید:");

    if (!secret || !secret.trim()) {
      alert("برای حذف کاربر باید رمز محرمانه ادمین را وارد کنید");
      return;
    }

    await api.delete(`/api/admin/user/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: {
        admin_edit_secret: secret.trim(),
      },
    });

    setUsers((prev) => prev.filter((u) => u.id !== id));
    loadStats();

    alert("کاربر با موفقیت حذف شد");
  } catch (err) {
    console.error(err);
    alert(err.response?.data?.error || "خطا در حذف کاربر");
  }
};

  const deletePost = async (id) => {
    try {
      if (!window.confirm("پست حذف شود؟")) return;

      await api.delete(`/api/admin/post/${id}`, authHeader);

      setPosts((prev) => prev.filter((p) => p.id !== id));
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

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search users, posts, comments, reports..."
        style={{
          width: "100%",
          padding: "14px 16px",
          border: "1px solid #ddd",
          borderRadius: "12px",
          marginTop: "15px",
          marginBottom: "25px",
          fontSize: "16px",
          outline: "none",
        }}
      />

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

      <h2>Reports ({filteredReports.length})</h2>
      {filteredReports.length === 0 && <p>No Reports</p>}

      {filteredReports.map((report) => (
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

      <h2 style={{ marginTop: "50px" }}>Users ({filteredUsers.length})</h2>

      <div style={{ overflowX: isMobile ? "auto" : "visible" }}>
        <table
          style={{
            width: "100%",
            minWidth: isMobile ? "850px" : "100%",
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
            {filteredUsers.map((user) => (
              <tr
                key={user.id}
                style={{
                  borderBottom: "1px solid #ddd",
                  backgroundColor: user.banned ? "#ffe5e5" : "transparent",
                }}
              >
                <td>{user.id}</td>
                <td>@{user.username}</td>
                <td>{user.display_name}</td>
                <td>{user.is_verified ? "✅" : "❌"}</td>
                <td>{user.banned ? "🚫" : "✅"}</td>
                <td>
                  {user.role}
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
                  <button onClick={() => openEditUser(user)}>
                    Edit Account
                  </button>

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
      </div>

      <h2 style={{ marginTop: "50px" }}>Posts ({filteredPosts.length})</h2>

      {filteredPosts.map((post) => (
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

      <h2 style={{ marginTop: "50px" }}>
        Comments ({filteredComments.length})
      </h2>

      {filteredComments.map((comment) => (
        <div key={comment.id} style={boxStyle}>
          <p>{comment.content}</p>

          <button onClick={() => deleteComment(comment.id)} style={dangerButton}>
            Delete Comment
          </button>
        </div>
      ))}

      {editingUser && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99999,
            padding: "15px",
          }}
        >
          <div
            style={{
              width: "420px",
              maxWidth: "100%",
              background: "#fff",
              borderRadius: "16px",
              padding: "20px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
            }}
          >
            <h2>Change User Account</h2>

            <p
              style={{
                color: "#64748b",
                fontSize: "14px",
                lineHeight: "1.8",
              }}
            >
              رمز قبلی کاربر قابل مشاهده نیست. فقط می‌توانی رمز جدید برای او
              ثبت کنی.
            </p>

            <label>Username</label>
            <input
              value={editUsername}
              onChange={(e) => setEditUsername(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                margin: "8px 0 14px",
              }}
            />

            <label>Display Name</label>
            <input
              value={editDisplayName}
              onChange={(e) => setEditDisplayName(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                margin: "8px 0 14px",
              }}
            />

            <label>New Password</label>
            <input
              type="password"
              value={editPassword}
              onChange={(e) => setEditPassword(e.target.value)}
              placeholder="اگر نمی‌خواهی رمز عوض شود خالی بگذار"
              style={{
                width: "100%",
                padding: "10px",
                margin: "8px 0 14px",
              }}
            />

            <label>Admin Edit Password</label>
            <input
              type="password"
              value={adminEditSecret}
              onChange={(e) => setAdminEditSecret(e.target.value)}
              placeholder="رمز مخصوص ویرایش ادمین"
              style={{
                width: "100%",
                padding: "10px",
                margin: "8px 0 18px",
              }}
            />

            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
              }}
            >
              <button onClick={closeEditUser}>Cancel</button>

              <button
                onClick={saveUserAccount}
                style={{
                  background: "#1d9bf0",
                  color: "#fff",
                  border: "none",
                  padding: "9px 16px",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}