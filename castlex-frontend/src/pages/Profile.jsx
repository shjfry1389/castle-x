import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import api from "../services/api";
import PostCard from "../components/PostCard";
function ShareIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.6 10.7L15.4 6.3" />
      <path d="M8.6 13.3L15.4 17.7" />
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

function SilverBadge({ size = 22 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-label="Premium"
      style={{
        filter:
          "drop-shadow(0 0 4px #ffffff) drop-shadow(0 0 8px #c0c0c0) drop-shadow(0 0 14px #9ca3af)",
      }}
    >
      <defs>
        <linearGradient
          id="profileSilverBadgeGradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="25%" stopColor="#e5e7eb" />
          <stop offset="50%" stopColor="#9ca3af" />
          <stop offset="75%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#6b7280" />
        </linearGradient>
      </defs>

      <path
        fill="url(#profileSilverBadgeGradient)"
        stroke="#ffffff"
        strokeWidth="0.8"
        d="M22.5 12c0 1.1-1.1 2-1.4 3-.3 1.1.1 2.5-.5 3.4-.6.9-2 .9-2.9 1.5-.9.6-1.5 1.9-2.6 2.2-1 .3-2.2-.5-3.3-.5s-2.3.8-3.3.5c-1.1-.3-1.7-1.6-2.6-2.2-.9-.6-2.3-.6-2.9-1.5-.6-.9-.2-2.3-.5-3.4-.3-1-1.4-1.9-1.4-3s1.1-2 1.4-3c.3-1.1-.1-2.5.5-3.4.6-.9 2-.9 2.9-1.5.9-.6 1.5-1.9 2.6-2.2 1-.3 2.2.5 3.3.5s2.3-.8 3.3-.5c1.1.3 1.7 1.6 2.6 2.2.9.6 2.3.6 2.9 1.5.6.9.2 2.3.5 3.4.3 1 1.4 1.9 1.4 3z"
      />

      <path
        fill="#111827"
        d="M10.3 15.3 7.7 12.7l-1.1 1.1 3.7 3.7 7.1-7.1-1.1-1.1z"
      />
    </svg>
  );
}
export default function Profile() {
  const { username } = useParams();
  const profileUsername = decodeURIComponent(username || "");
  const navigate = useNavigate();
    const location = useLocation();
  const targetPostId = new URLSearchParams(location.search).get("post");

  const [currentUser, setCurrentUser] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [followListOpen, setFollowListOpen] = useState(false);
  const [followListTitle, setFollowListTitle] = useState("");
  const [followUsers, setFollowUsers] = useState([]);
  const [followListLoading, setFollowListLoading] = useState(false);

  useEffect(() => {
    if (!profileUsername) return;

    api
      .get(`/api/users/${profileUsername}`)
      .then((res) => setUser(res.data))
      .catch(console.error);

    api
      .get(`/api/users/${profileUsername}/posts`)
      .then((res) => setPosts(res.data))
      .catch(console.error);

    const token = localStorage.getItem("token");

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setCurrentUser(payload);
      } catch (err) {
        console.error(err);
      }
    }
  }, [profileUsername]);

  useEffect(() => {
    if (!user) return;

    setEditName(user.display_name || "");
    setEditBio(user.bio || "");

    const token = localStorage.getItem("token");
    if (!token) return;

    api
      .get(`/api/users/${user.id}/is-following`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setIsFollowing(res.data.following);
      })
      .catch(console.error);
  }, [user]);
    useEffect(() => {
    if (!targetPostId) return;

    const token = localStorage.getItem("token");

    if (!token) {
      alert("برای دیدن این پست باید وارد حساب کاربری شوید");

      window.location.href = `/login?redirect=${encodeURIComponent(
        `${location.pathname}${location.search}`
      )}`;

      return;
    }

    if (!posts || posts.length === 0) return;

    const timer = setTimeout(() => {
      const postElement = document.getElementById(`post-${targetPostId}`);

      if (postElement) {
        postElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        postElement.style.boxShadow = "0 0 0 3px rgba(29,155,240,0.35)";
        postElement.style.borderRadius = "16px";
        postElement.style.transition = "box-shadow 0.3s ease";

        setTimeout(() => {
          postElement.style.boxShadow = "";
        }, 2200);
      }
    }, 700);

    return () => clearTimeout(timer);
  }, [targetPostId, posts, location.pathname, location.search]);

  const uploadAvatar = async () => {
    try {
      if (!avatarFile) {
        alert("یک عکس انتخاب کن");
        return;
      }

      if (avatarFile.size > 5 * 1024 * 1024) {
        alert("حجم عکس بیشتر از 5MB است");
        return;
      }

      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("avatar", avatarFile);

      const res = await api.post("/api/upload/avatar", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(res.data.user);
      setAvatarFile(null);

      alert("آواتار آپدیت شد");
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "خطا در آپلود"
      );
    }
  };

  const saveProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      await api.put(
        "/api/users/me",
        {
          display_name: editName,
          bio: editBio,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const res = await api.get(`/api/users/${profileUsername}`);
      setUser(res.data);
      setEditing(false);

      alert("ذخیره شد");
    } catch (err) {
      console.error(err);
    }
  };

  const handleFollow = async () => {
    try {
      const token = localStorage.getItem("token");

      if (isFollowing) {
        await api.delete(`/api/users/${user.id}/follow`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setIsFollowing(false);
      } else {
        await api.post(
          `/api/users/${user.id}/follow`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setIsFollowing(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMessage = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.post(
        "/api/messages/start",
        {
          userId: user.id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate(`/chat/${res.data.conversation_id}`);
    } catch (err) {
      console.error(err);
    }
  };
  const shareProfile = async () => {
    const profileLink = `${window.location.origin}/profile/${encodeURIComponent(
      user.username
    )}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Castle X",
          text: `پروفایل ${user.username} رو ببین`,
          url: profileLink,
        });
      } else {
        await navigator.clipboard.writeText(profileLink);
        alert("لینک پروفایل کپی شد");
      }
    } catch (err) {
      console.error(err);
    }
  };
  const openFollowList = async (type) => {
    try {
      setFollowListLoading(true);
      setFollowUsers([]);
      setFollowListTitle(type === "followers" ? "Followers" : "Following");
      setFollowListOpen(true);

      const res = await api.get(`/api/users/${profileUsername}/${type}`);

      setFollowUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);

      if (err.response?.status === 403) {
        alert("لیست فالوور و فالووینگ ادمین قابل مشاهده نیست");
      } else {
        alert("خطا در دریافت لیست");
      }
    } finally {
      setFollowListLoading(false);
    }
  };

  if (!user) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "80px",
          fontSize: "18px",
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "0 auto",
        background: "#fff",
        minHeight: "100vh",
        borderLeft: "1px solid #eff3f4",
        borderRight: "1px solid #eff3f4",
        paddingBottom: "90px",
      }}
    >
      <div
        style={{
          padding: "15px 20px",
          borderBottom: "1px solid #eff3f4",
          background: "#fff",
          position: "sticky",
          top: 0,
          zIndex: 100,
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
          }}
        >
          🏠 Home
        </button>
      </div>

      <div
        style={{
          height: "230px",
          background: "linear-gradient(135deg,#1d9bf0,#6d28d9)",
        }}
      />

      <div style={{ padding: "0 20px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "15px",
          }}
        >
          <img
            src={
              user.avatar_url ||
              "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
            }
            alt=""
            style={{
              width: "140px",
              height: "140px",
              borderRadius: "50%",
              border: "5px solid white",
              objectFit: "cover",
              marginTop: "-70px",
            }}
          />

          <div
            style={{
              marginTop: "15px",
              display: "flex",
              gap: "10px",
              alignItems: "center",
              flexWrap: "wrap",
              justifyContent: "flex-end",
            }}
            
          >
            <button
  onClick={shareProfile}
  title="Share profile"
  style={{
    border: "1px solid #cfd9de",
    background: "white",
    color: "#0f172a",
    borderRadius: "9999px",
    padding: "10px 14px",
    cursor: "pointer",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    gap: "7px",
  }}
>
  <ShareIcon />
  Share
</button>
            {currentUser?.username !== user.username && (
              <>
                <button
                  onClick={handleFollow}
                  style={{
                    border: "none",
                    background: isFollowing ? "#eff3f4" : "#000",
                    color: isFollowing ? "#000" : "#fff",
                    borderRadius: "9999px",
                    padding: "10px 20px",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>

                <button
                  onClick={handleMessage}
                  style={{
                    border: "1px solid #cfd9de",
                    background: "white",
                    borderRadius: "9999px",
                    padding: "10px 18px",
                    cursor: "pointer",
                  }}
                >
                  Message
                </button>

                <button
                  onClick={async () => {
                    const reason = prompt("دلیل گزارش را وارد کنید:");
                    if (!reason) return;

                    try {
                      const token = localStorage.getItem("token");

                      await api.post(
                        "/api/reports",
                        {
                          target_user_id: user.id,
                          reason,
                        },
                        {
                          headers: {
                            Authorization: `Bearer ${token}`,
                          },
                        }
                      );

                      alert("گزارش با موفقیت ثبت شد");
                    } catch (err) {
                      console.error(err);
                      alert("خطا در ثبت گزارش");
                    }
                  }}
                  style={{
                    border: "1px solid #ef4444",
                    background: "#fff",
                    color: "#ef4444",
                    borderRadius: "9999px",
                    padding: "10px 18px",
                    cursor: "pointer",
                  }}
                >
                  🚩 Report
                </button>
              </>
            )}
          </div>
        </div>

        <div style={{ marginTop: "15px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <h1
              style={{
                margin: 0,
                fontSize: "26px",
                fontWeight: "800",
              }}
            >
              {user.display_name}
            </h1>

            {user.role === "admin" ? (
              <svg
                viewBox="0 0 24 24"
                width="22"
                height="22"
                style={{
                  filter:
                    "drop-shadow(0 0 6px #facc15) drop-shadow(0 0 12px #facc15)",
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
            ) : user.is_verified ? (
              <svg viewBox="0 0 24 24" width="22" height="22">
                <path
                  fill="#1D9BF0"
                  d="M22.5 12c0 1.1-1.1 2-1.4 3-.3 1.1.1 2.5-.5 3.4-.6.9-2 .9-2.9 1.5-.9.6-1.5 1.9-2.6 2.2-1 .3-2.2-.5-3.3-.5s-2.3.8-3.3.5c-1.1-.3-1.7-1.6-2.6-2.2-.9-.6-2.3-.6-2.9-1.5-.6-.9-.2-2.3-.5-3.4-.3-1-1.4-1.9-1.4-3s1.1-2 1.4-3c.3-1.1-.1-2.5.5-3.4.6-.9 2-.9 2.9-1.5.9-.6 1.5-1.9 2.6-2.2 1-.3 2.2.5 3.3.5s2.3-.8 3.3-.5c1.1.3 1.7 1.6 2.6 2.2.9.6 2.3.6 2.9 1.5.6.9.2 2.3.5 3.4.3 1 1.4 1.9 1.4 3z"
                />
                <path
                  fill="#fff"
                  d="M10.3 15.3 7.7 12.7l-1.1 1.1 3.7 3.7 7.1-7.1-1.1-1.1z"
                />
              </svg>
            ) : null}
            {user.role !== "admin" && isPremiumActive(user) && (
  <SilverBadge size={22} />
)}
          </div>

          <div style={{ color: "#536471", marginTop: "4px" }}>
            @{user.username}
          </div>
          {isPremiumActive(user) && (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      marginTop: "10px",
      padding: "6px 12px",
      borderRadius: "999px",
      background: "linear-gradient(135deg,#f8fafc,#cbd5e1,#94a3b8)",
      color: "#111827",
      fontSize: "13px",
      fontWeight: "800",
      boxShadow: "0 0 14px rgba(148,163,184,0.55)",
    }}
  >
    ✦ Silver Member
  </div>
)}

          {user.bio && (
            <div style={{ marginTop: "14px", fontSize: "15px" }}>
              {user.bio}
            </div>
          )}

          <div
            style={{
              display: "flex",
              gap: "20px",
              marginTop: "15px",
              color: "#536471",
            }}
          >
            <button
              onClick={() => openFollowList("following")}
              style={{
                border: "none",
                background: "none",
                color: "inherit",
                cursor: "pointer",
                padding: 0,
                fontSize: "15px",
              }}
            >
              <b>{user.following_count}</b> Following
            </button>

            <button
              onClick={() => openFollowList("followers")}
              style={{
                border: "none",
                background: "none",
                color: "inherit",
                cursor: "pointer",
                padding: 0,
                fontSize: "15px",
              }}
            >
              <b>{user.followers_count}</b> Followers
            </button>
          </div>

          {currentUser?.username === user.username && (
            <div
              style={{
                marginTop: "20px",
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={() => setEditing(!editing)}
                style={{
                  border: "1px solid #cfd9de",
                  background: "#fff",
                  borderRadius: "999px",
                  padding: "10px 18px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                ✏️ Edit Profile
              </button>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => setAvatarFile(e.target.files[0])}
              />

              <button
                onClick={uploadAvatar}
                style={{
                  border: "none",
                  background: "#1d9bf0",
                  color: "#fff",
                  borderRadius: "999px",
                  padding: "10px 18px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                📷 Upload Avatar
              </button>
            </div>
          )}
        </div>

        {editing && (
          <div
            style={{
              marginTop: "25px",
              background: "#f8fafc",
              padding: "20px",
              borderRadius: "16px",
            }}
          >
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Display Name"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "12px",
                border: "1px solid #ddd",
              }}
            />

            <br />
            <br />

            <textarea
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              rows="4"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "12px",
                border: "1px solid #ddd",
              }}
            />

            <br />
            <br />

            <button
              onClick={saveProfile}
              style={{
                background: "#1d9bf0",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "9999px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Save
            </button>
          </div>
        )}
      </div>

      <div
        style={{
          marginTop: "25px",
          borderTop: "1px solid #eff3f4",
        }}
      >
        {posts.length === 0 ? (
          <div
            style={{
              padding: "40px",
              textAlign: "center",
              color: "#536471",
            }}
          >
            No posts yet
          </div>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>

      {followListOpen && (
        <div
          onClick={() => setFollowListOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "420px",
              maxHeight: "80vh",
              overflowY: "auto",
              background: "#fff",
              borderRadius: "18px",
              padding: "18px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "15px",
              }}
            >
              <h3 style={{ margin: 0 }}>{followListTitle}</h3>

              <button
                onClick={() => setFollowListOpen(false)}
                style={{
                  border: "none",
                  background: "none",
                  fontSize: "22px",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            {followListLoading ? (
              <div style={{ padding: "20px", textAlign: "center" }}>
                Loading...
              </div>
            ) : followUsers.length === 0 ? (
              <div
                style={{
                  padding: "20px",
                  textAlign: "center",
                  color: "#536471",
                }}
              >
                لیست خالی است
              </div>
            ) : (
              followUsers.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setFollowListOpen(false);
                    navigate(`/profile/${encodeURIComponent(item.username)}`);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 0",
                    borderBottom: "1px solid #eff3f4",
                    cursor: "pointer",
                  }}
                >
                  <img
                    src={
                      item.avatar_url ||
                      "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
                    }
                    alt=""
                    style={{
                      width: "46px",
                      height: "46px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: isPremiumActive(user)
  ? "3px solid #c0c0c0"
  : "3px solid transparent",
boxShadow: isPremiumActive(user)
  ? "0 0 0 3px rgba(255,255,255,0.9), 0 0 18px rgba(192,192,192,0.95)"
  : "none",
padding: isPremiumActive(user) ? "3px" : "0",
background: isPremiumActive(user)
  ? "linear-gradient(135deg,#ffffff,#c0c0c0,#6b7280)"
  : "transparent",
                    }}
                  />

                  <div>
                    <div style={{ fontWeight: "700" }}>
                      {item.display_name || item.username}
                    </div>

                    <div style={{ color: "#536471", fontSize: "14px" }}>
                      @{item.username}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}