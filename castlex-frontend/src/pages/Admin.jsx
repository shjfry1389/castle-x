import { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";

export default function Admin() {
  const isMobile = window.innerWidth <= 768;

  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [hotRequests, setHotRequests] = useState([]);
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
  const [topPosts, setTopPosts] = useState(null);
  const [customNotifTitle, setCustomNotifTitle] = useState("Castle X");
const [customNotifMessage, setCustomNotifMessage] = useState("");
const [customNotifTarget, setCustomNotifTarget] = useState("all");
const [customNotifUsernames, setCustomNotifUsernames] = useState("");
const [customNotifType, setCustomNotifType] = useState("admin_custom");
const [customNotifSending, setCustomNotifSending] = useState(false);

  const token = localStorage.getItem("token");

  const authHeader = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

useEffect(() => {
  loadUsers();
  loadStats();
  loadTopPosts();
  loadPosts();
  loadComments();
  loadHotRequests();
  loadReports();
}, []);

  const matchesSearch = (...values) => {
    const q = search.trim().toLowerCase();

    if (!q) return true;

    return values
      .filter((value) => value !== null && value !== undefined)
      .some((value) => String(value).toLowerCase().includes(q));
  };
  const isPremiumActive = (user) => {
  return (
    user?.premium_plan === "silver" &&
    user?.premium_until &&
    new Date(user.premium_until).getTime() > Date.now()
  );
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
      ,
isPremiumActive(user) ? "premium" : "free",
user.premium_plan,
user.premium_until
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
  const filteredHotRequests = hotRequests.filter((request) =>
  matchesSearch(
    request.id,
    request.status,
    request.user?.username,
    request.user?.display_name,
    request.post?.content,
    request.post_id
  )
);

  const loadReports = async () => {
    try {
      const res = await api.get("/api/admin/reports", authHeader);
      setReports(res.data);
    } catch (err) {
      console.error(err);
    }
  };
  const loadHotRequests = async () => {
  try {
    const res = await api.get("/api/admin/hot-requests", authHeader);
    setHotRequests(res.data);
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
  const loadTopPosts = async () => {
  try {
    const res = await api.get("/api/admin/top-posts", authHeader);
    setTopPosts(res.data);
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
const activatePremium = async (user) => {
  try {
    const months = window.prompt("Premium چند ماه فعال شود؟", "1");

    if (!months) return;

    const res = await api.put(
      `/api/admin/users/${user.id}/premium`,
      {
        months: Number(months),
      },
      authHeader
    );

    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, ...res.data.user } : u))
    );

    alert("Premium فعال شد");
  } catch (err) {
    console.error(err);
    alert(err.response?.data?.error || "خطا در فعال کردن Premium");
  }
};

const removePremium = async (user) => {
  try {
    if (!window.confirm("Premium این کاربر حذف شود؟")) return;

    const res = await api.delete(
      `/api/admin/users/${user.id}/premium`,
      authHeader
    );

    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, ...res.data.user } : u))
    );

    alert("Premium حذف شد");
  } catch (err) {
    console.error(err);
    alert(err.response?.data?.error || "خطا در حذف Premium");
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

    await api.post(
      `/api/admin/users/${id}/delete-secure`,
      {
        admin_edit_secret: secret.trim(),
      },
      authHeader
    );

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
  const makeHotPost = async (post) => {
  try {
    const duration = window.prompt("پست چند ساعت داغ باشد؟", "24");
    if (!duration) return;

    const interval = window.prompt("هر چند دقیقه دوباره بالا بیاید؟", "60");
    if (!interval) return;

    const priority = window.prompt("اولویت چند باشد؟ عدد 1 تا 10", "1");
    if (!priority) return;

    await api.post(
      `/api/admin/posts/${post.id}/hot`,
      {
        duration_hours: Number(duration),
        bump_interval_minutes: Number(interval),
        priority: Number(priority),
      },
      authHeader
    );

    setPosts((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, is_hot: true } : p))
    );

    alert("پست داغ شد");
  } catch (err) {
    console.error(err);
    alert(err.response?.data?.error || "خطا در داغ کردن پست");
  }
};

const stopHotPost = async (post) => {
  try {
    await api.post(`/api/admin/posts/${post.id}/stop-hot`, {}, authHeader);

    setPosts((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, is_hot: false } : p))
    );

    alert("پست از حالت داغ خارج شد");
  } catch (err) {
    console.error(err);
    alert(err.response?.data?.error || "خطا در خاموش کردن پست داغ");
  }
};
const approveHotRequest = async (request) => {
  try {
    const duration = window.prompt("پست چند ساعت داغ باشد؟", "24");
    if (!duration) return;

    const interval = window.prompt("هر چند دقیقه دوباره بالا بیاید؟", "60");
    if (!interval) return;

    const priority = window.prompt("اولویت چند باشد؟ عدد 1 تا 10", "1");
    if (!priority) return;

    const adminNote = window.prompt("یادداشت ادمین اختیاری:", "");

    const res = await api.post(
      `/api/admin/hot-requests/${request.id}/approve`,
      {
        duration_hours: Number(duration),
        bump_interval_minutes: Number(interval),
        priority: Number(priority),
        admin_note: adminNote || "",
      },
      authHeader
    );

    setHotRequests((prev) =>
      prev.map((item) =>
        item.id === request.id ? { ...item, ...res.data.request } : item
      )
    );

    setPosts((prev) =>
      prev.map((post) =>
        post.id === request.post_id ? { ...post, is_hot: true } : post
      )
    );

    alert("درخواست تایید شد و پست داغ شد");
  } catch (err) {
    console.error(err);
    alert(err.response?.data?.error || "خطا در تایید درخواست");
  }
};

const rejectHotRequest = async (request) => {
  try {
    const adminNote = window.prompt("دلیل رد درخواست اختیاری:", "");

    const res = await api.post(
      `/api/admin/hot-requests/${request.id}/reject`,
      {
        admin_note: adminNote || "",
      },
      authHeader
    );

    setHotRequests((prev) =>
      prev.map((item) =>
        item.id === request.id ? { ...item, ...res.data.request } : item
      )
    );

    alert("درخواست رد شد");
  } catch (err) {
    console.error(err);
    alert(err.response?.data?.error || "خطا در رد درخواست");
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
    const sendCustomNotification = async () => {
    try {
      if (!customNotifMessage.trim()) {
        alert("متن نوتیفیکیشن را وارد کن");
        return;
      }

      if (customNotifTarget === "specific" && !customNotifUsernames.trim()) {
        alert("برای ارسال به افراد مشخص، یوزرنیم‌ها را وارد کن");
        return;
      }

      setCustomNotifSending(true);

      const res = await api.post(
        "/api/admin/notifications/custom",
        {
          title: customNotifTitle.trim() || "Castle X",
          message: customNotifMessage.trim(),
          target_type: customNotifTarget,
          usernames: customNotifUsernames,
          notification_type: customNotifType || "admin_custom",
        },
        authHeader
      );

      alert(`نوتیفیکیشن برای ${res.data.sent_count || 0} کاربر ارسال شد`);
      setCustomNotifMessage("");
      setCustomNotifUsernames("");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "خطا در ارسال نوتیفیکیشن");
    } finally {
      setCustomNotifSending(false);
    }
  };
const announceWeeklyWinners = async () => {
  try {
    if (!window.confirm("نتایج رتبه‌بندی هفته برای همه کاربران ارسال شود؟")) {
      return;
    }

    const res = await api.post(
      "/api/admin/rankings/announce-weekly",
      {},
      authHeader
    );

    alert(`نوتیف رتبه‌بندی برای ${res.data.sent_count || 0} کاربر ارسال شد`);
  } catch (err) {
    console.error(err);
    alert(err.response?.data?.error || "خطا در ارسال نتایج هفته");
  }
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
    marginTop: "22px",
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    padding: "18px",
    boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
  }}
>
  <h2 style={{ marginTop: 0, marginBottom: "12px" }}>
    ارسال نوتیفیکیشن اختصاصی
  </h2>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
      gap: "12px",
      marginBottom: "12px",
    }}
  >
    <input
      value={customNotifTitle}
      onChange={(e) => setCustomNotifTitle(e.target.value)}
      placeholder="عنوان نوتیفیکیشن"
      style={{
        padding: "12px",
        borderRadius: "12px",
        border: "1px solid #cbd5e1",
      }}
    />

    <select
      value={customNotifTarget}
      onChange={(e) => setCustomNotifTarget(e.target.value)}
      style={{
        padding: "12px",
        borderRadius: "12px",
        border: "1px solid #cbd5e1",
      }}
    >
      <option value="all">همه کاربران</option>
      <option value="admins">فقط ادمین‌ها</option>
      <option value="verified">فقط تیک آبی‌ها</option>
      <option value="premium">فقط پریمیوم‌ها</option>
      <option value="normal">کاربران معمولی</option>
      <option value="specific">یوزرنیم‌های مشخص</option>
    </select>
  </div>

  {customNotifTarget === "specific" && (
    <textarea
      value={customNotifUsernames}
      onChange={(e) => setCustomNotifUsernames(e.target.value)}
      placeholder="یوزرنیم‌ها را با کاما جدا کن: sharmin, Donald_Amin"
      rows={2}
      style={{
        width: "100%",
        padding: "12px",
        borderRadius: "12px",
        border: "1px solid #cbd5e1",
        marginBottom: "12px",
        resize: "none",
      }}
    />
  )}

  <textarea
    value={customNotifMessage}
    onChange={(e) => setCustomNotifMessage(e.target.value)}
    placeholder="متن نوتیفیکیشن..."
    rows={4}
    style={{
      width: "100%",
      padding: "12px",
      borderRadius: "12px",
      border: "1px solid #cbd5e1",
      marginBottom: "12px",
      resize: "none",
    }}
  />

  <div
    style={{
      display: "flex",
      gap: "12px",
      flexDirection: isMobile ? "column" : "row",
    }}
  >
    <select
      value={customNotifType}
      onChange={(e) => setCustomNotifType(e.target.value)}
      style={{
        flex: 1,
        padding: "12px",
        borderRadius: "12px",
        border: "1px solid #cbd5e1",
      }}
    >
      <option value="admin_custom">پیام عمومی Castle X</option>
      <option value="broadcast">اطلاعیه رسمی</option>
      <option value="premium">پیام پریمیوم</option>
      <option value="weekly_ranking">پیام رتبه‌بندی</option>
    </select>

    <button
      onClick={sendCustomNotification}
      disabled={customNotifSending}
      style={{
        border: "none",
        background: customNotifSending ? "#94a3b8" : "#1d9bf0",
        color: "#fff",
        padding: "12px 20px",
        borderRadius: "999px",
        cursor: customNotifSending ? "not-allowed" : "pointer",
        fontWeight: "bold",
      }}
    >
      {customNotifSending ? "در حال ارسال..." : "ارسال نوتیفیکیشن"}
    </button>
  </div>
</div>
<div
  style={{
    marginTop: "18px",
    marginBottom: "24px",
    background: "#fff7ed",
    border: "1px solid #fed7aa",
    borderRadius: "18px",
    padding: "18px",
  }}
>
  <h2 style={{ marginTop: 0, marginBottom: "8px" }}>
    اعلام برندگان هفته
  </h2>

  <p
    style={{
      marginTop: 0,
      color: "#9a3412",
      fontSize: "14px",
      lineHeight: "1.7",
    }}
  >
    با زدن این دکمه، نفرات اول تا سوم هفته برای همه کاربران ارسال می‌شود و
    خود برنده‌ها هم نوتیف تبریک جداگانه می‌گیرند.
  </p>

  <button
    onClick={announceWeeklyWinners}
    style={{
      border: "none",
      background: "linear-gradient(135deg,#facc15,#f97316)",
      color: "#111827",
      padding: "12px 18px",
      borderRadius: "999px",
      cursor: "pointer",
      fontWeight: "900",
    }}
  >
    ارسال نتایج برندگان هفته
  </button>
</div>
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
      {topPosts && (
  <div
    style={{
      marginBottom: "40px",
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
      gap: "16px",
    }}
  >
    {[
      {
        title: "Most Viewed Post",
        data: topPosts.top_viewed,
        color: "#6366f1",
        label: "Views",
      },
      {
        title: "Most Liked Post",
        data: topPosts.top_liked,
        color: "#ec4899",
        label: "Likes",
      },
      {
        title: "Most Commented Post",
        data: topPosts.top_commented,
        color: "#f59e0b",
        label: "Comments",
      },
    ].map((item) => (
      <div
        key={item.title}
        style={{
          background: "#fff",
          border: `1px solid ${item.color}`,
          borderRadius: "16px",
          padding: "16px",
          boxShadow: "0 8px 22px rgba(0,0,0,0.08)",
        }}
      >
        <h3 style={{ marginTop: 0, color: item.color }}>{item.title}</h3>

        {item.data ? (
          <>
            <div
              style={{
                fontWeight: "800",
                marginBottom: "8px",
              }}
            >
              {item.label}: {item.data.count || 0}
            </div>

            <div
              style={{
                color: "#536471",
                fontSize: "14px",
                marginBottom: "10px",
              }}
            >
              @{item.data.author?.username || "unknown"}
            </div>

            <p
              style={{
                fontSize: "14px",
                lineHeight: "1.7",
                maxHeight: "70px",
                overflow: "hidden",
              }}
            >
              {item.data.content || "No text"}
            </p>

            <a
              href={item.data.post_url}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-block",
                marginTop: "8px",
                color: "#fff",
                background: item.color,
                padding: "8px 12px",
                borderRadius: "999px",
                textDecoration: "none",
                fontWeight: "800",
              }}
            >
              Open Post
            </a>
          </>
        ) : (
          <p style={{ color: "#64748b" }}>No post yet</p>
        )}
      </div>
    ))}
  </div>
)}
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
      <h2 style={{ marginTop: "50px" }}>
  Hot Post Requests ({filteredHotRequests.length})
</h2>

{filteredHotRequests.length === 0 && <p>No Hot Requests</p>}

{filteredHotRequests.map((request) => (
  <div key={request.id} style={boxStyle}>
    <p>
      <b>Request ID:</b> {request.id}
    </p>

    <p>
      <b>User:</b>{" "}
      {request.user?.display_name || request.user?.username || "Unknown"}{" "}
      {request.user?.username && `@${request.user.username}`}
    </p>

    <p>
      <b>Post ID:</b> {request.post_id}
    </p>

    <p>
      <b>Post:</b> {request.post?.content || "No content"}
    </p>

    <p>
      <b>Status:</b>{" "}
      <span
        style={{
          fontWeight: "bold",
          color:
            request.status === "approved"
              ? "#16a34a"
              : request.status === "rejected"
              ? "#ef4444"
              : "#f59e0b",
        }}
      >
        {request.status}
      </span>
    </p>

    {request.admin_note && (
      <p>
        <b>Admin Note:</b> {request.admin_note}
      </p>
    )}

    {request.status === "pending" && (
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <button
          onClick={() => approveHotRequest(request)}
          style={{
            background: "#22c55e",
            color: "#fff",
            border: "none",
            padding: "8px 14px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Approve
        </button>

        <button onClick={() => rejectHotRequest(request)} style={dangerButton}>
          Reject
        </button>
      </div>
    )}
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
              <th>Premium</th>
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
                <td>
  {isPremiumActive(user) ? (
    <span style={{ color: "#64748b", fontWeight: "bold" }}>
      Silver تا{" "}
      {new Date(user.premium_until).toLocaleDateString("fa-IR")}
    </span>
  ) : (
    "Free"
  )}
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
                  {isPremiumActive(user) ? (
  <button onClick={() => removePremium(user)}>Remove Premium</button>
) : (
  <button onClick={() => activatePremium(user)}>Make Premium</button>
)}

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
          <button
  onClick={() => makeHotPost(post)}
  style={{
    background: "#f59e0b",
    color: "#fff",
    border: "none",
    padding: "8px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    marginLeft: "8px",
  }}
>
  Make Hot
</button>

<button
  onClick={() => stopHotPost(post)}
  style={{
    background: "#334155",
    color: "#fff",
    border: "none",
    padding: "8px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    marginLeft: "8px",
  }}
>
  Stop Hot
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