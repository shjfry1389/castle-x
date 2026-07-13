import { Link } from "react-router-dom";
import { supabase } from "../supabase";
import PostCard from "../components/PostCard";
import { useEffect, useState } from "react";
import api from "../services/api";

export default function Home() {
const [posts, setPosts] = useState([]);
const [content, setContent] = useState("");
const [media, setMedia] = useState(null);
const [feedMode, setFeedMode] = useState("forYou");
const [feedSwitching, setFeedSwitching] = useState(false);
const [loading, setLoading] = useState(false);
const [postsLoading, setPostsLoading] = useState(false);
const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(true);
const [postMode, setPostMode] = useState("post");
const [pollQuestion, setPollQuestion] = useState("");
const [pollOptions, setPollOptions] = useState(["", ""]);
const [pollDuration, setPollDuration] = useState(24);
const [trendingHashtags, setTrendingHashtags] = useState([]);

const POSTS_LIMIT = 15;
const token = localStorage.getItem("token");

const currentUser = token
  ? JSON.parse(atob(token.split(".")[1]))
  : null;
  const fullCurrentUser = {
  ...currentUser,
  role: currentUser?.role || localStorage.getItem("role"),
  premium_plan:
    currentUser?.premium_plan || localStorage.getItem("premium_plan"),
  premium_until:
    currentUser?.premium_until || localStorage.getItem("premium_until"),
};

const isPremiumActive = (user) => {
  return (
    user?.premium_plan === "silver" &&
    user?.premium_until &&
    new Date(user.premium_until).getTime() > Date.now()
  );
};

const canUsePremiumFeature =
  fullCurrentUser?.role === "admin" || isPremiumActive(fullCurrentUser);
const switchFeed = (mode) => {
  if (mode === feedMode) return;

  setFeedSwitching(true);
  setPosts([]);
  setPage(1);
  setHasMore(true);

  setTimeout(() => {
    setFeedMode(mode);
    setFeedSwitching(false);
  }, 140);
};
const loadPosts = async (mode = feedMode, nextPage = 1, append = false) => {
  const token = localStorage.getItem("token");

  const endpoint = mode === "following" ? "/api/posts/following" : "/api/posts";

  try {
    setPostsLoading(true);

    const res = await api.get(endpoint, {
      params: {
        limit: POSTS_LIMIT,
        page: nextPage,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const newPosts = Array.isArray(res.data) ? res.data : [];

    setPosts((prev) => (append ? [...prev, ...newPosts] : newPosts));
    setPage(nextPage);
    setHasMore(newPosts.length === POSTS_LIMIT);
  } catch (err) {
    console.error(err);
  } finally {
    setPostsLoading(false);
  }
};
const loadTrendingHashtags = async () => {
  try {
    const res = await api.get("/api/hashtags/trending");

    setTrendingHashtags(Array.isArray(res.data) ? res.data : []);
  } catch (err) {
    console.error(err);
  }
};
useEffect(() => {
  loadPosts(feedMode);
  loadTrendingHashtags();
 const channel = supabase
  .channel(`home-feed-${feedMode}`)
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "posts",
    },
    () => {
      loadPosts(feedMode);
    }
  )
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "likes",
    },
    () => {
      loadPosts(feedMode);
    }
  )
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "comments",
    },
    () => {
      loadPosts(feedMode);
    }
  )
  .subscribe();
const refreshOnFocus = () => {
  loadPosts(feedMode);
};

window.addEventListener("focus", refreshOnFocus);
  return () => {
    window.removeEventListener("focus", refreshOnFocus);
    supabase.removeChannel(channel);
  };
}, [feedMode]);

const createPost = async () => {
const token = localStorage.getItem("token");

if (!token) {
  alert("اول وارد شوید");
  return;
}

if (!content.trim() && !media) {
  alert("متن یا فایل وارد کنید");
  return;
}

setLoading(true);

let imageUrl = "";
let videoUrl = "";

try {
  if (media) {
    if (media.size > 20 * 1024 * 1024) {
      alert("حجم فایل بیشتر از 20MB است");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("media", media);

    const uploadRes = await api.post(
      "/api/upload/post-media",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (uploadRes.data.type === "video") {
      videoUrl = uploadRes.data.url;
    } else {
      imageUrl = uploadRes.data.url;
    }
  }

  const res = await api.post(
    "/api/posts/create",
    {
      content,
      image_url: imageUrl,
      video_url: videoUrl,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  setContent("");
  setMedia(null);

if (res.data?.post) {
  if (feedMode === "forYou") {
    setPosts((prev) => [res.data.post, ...prev].slice(0, POSTS_LIMIT));
  } else {
    loadPosts(feedMode);
  }
}
} catch (err) {
  console.error(err);

  alert(
    err.response?.data?.error ||
    err.response?.data?.message ||
    JSON.stringify(err.response?.data) ||
    "خطا در ارسال پست"
  );
}

setLoading(false);
};
const createPoll = async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("اول وارد شوید");
    return;
  }

  if (!canUsePremiumFeature) {
    alert("ساخت نظرسنجی فقط برای کاربران پریمیوم و ادمین‌ها فعال است");
    return;
  }

  const cleanOptions = pollOptions
    .map((option) => option.trim())
    .filter(Boolean);

  if (!pollQuestion.trim()) {
    alert("سوال نظرسنجی را وارد کنید");
    return;
  }

  if (cleanOptions.length < 2) {
    alert("حداقل دو گزینه برای نظرسنجی وارد کنید");
    return;
  }

  try {
    setLoading(true);

    const res = await api.post(
      "/api/polls/create",
      {
        question: pollQuestion,
        options: cleanOptions,
        duration_hours: pollDuration,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setPollQuestion("");
    setPollOptions(["", ""]);
    setPollDuration(24);
    setPostMode("post");
    loadPosts(feedMode);
  } catch (err) {
    console.error(err);

    alert(
      err.response?.data?.error ||
        err.response?.data?.message ||
        "خطا در ساخت نظرسنجی"
    );
  } finally {
    setLoading(false);
  }
};
return (
<>
  <div
    style={{
      maxWidth: "700px",
      margin: "0 auto",
      minHeight: "100vh",
      background: "#fff",
      borderLeft: "1px solid #eff3f4",
      borderRight: "1px solid #eff3f4",
      paddingBottom: "90px",
    }}
  >
    <div
      className="for-you-bar"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #eff3f4",
        padding: "18px 20px",
      }}
    >
      <div
  style={{
    display: "flex",
    gap: "10px",
  }}
>
  <button
    onClick={() => switchFeed("forYou")}
    style={{
      border: "none",
      background: feedMode === "forYou" ? "#1d9bf0" : "transparent",
      color: feedMode === "forYou" ? "#fff" : "#111827",
      padding: "9px 16px",
      borderRadius: "999px",
      fontWeight: "800",
      cursor: "pointer",
    }}
  >
    For You
  </button>

  <button
    onClick={() => switchFeed("following")}
    style={{
      border: "none",
      background: feedMode === "following" ? "#1d9bf0" : "transparent",
      color: feedMode === "following" ? "#fff" : "#111827",
      padding: "9px 16px",
      borderRadius: "999px",
      fontWeight: "800",
      cursor: "pointer",
    }}
  >
    Following
  </button>
</div>
    </div>
   {trendingHashtags.length > 0 && (
  <div
    style={{
      padding: "16px 20px",
      borderBottom: "1px solid #eff3f4",
      background:
        "linear-gradient(135deg, rgba(29,155,240,0.08), rgba(99,102,241,0.06))",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "12px",
      }}
    >
      <div>
        <div
          style={{
            fontSize: "18px",
            fontWeight: "900",
            color: "#0f172a",
          }}
        >
          Trending Now
        </div>

        <div
          style={{
            fontSize: "13px",
            color: "#64748b",
            marginTop: "3px",
            fontWeight: "600",
          }}
        >
          Hashtags people are talking about
        </div>
      </div>

      <div
        style={{
          width: "38px",
          height: "38px",
          borderRadius: "50%",
          background: "#1d9bf0",
          color: "#fff",
          display: "grid",
          placeItems: "center",
          fontWeight: "900",
          boxShadow: "0 8px 20px rgba(29,155,240,0.28)",
        }}
      >
        #
      </div>
    </div>

    <div
      style={{
        display: "grid",
        gap: "9px",
      }}
    >
      {trendingHashtags.slice(0, 5).map((item, index) => (
        <Link
          key={item.tag}
          to={`/hashtag/${encodeURIComponent(item.tag)}`}
          style={{
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              padding: "11px 13px",
              borderRadius: "16px",
              background: "#fff",
              border: "1px solid rgba(226,232,240,0.9)",
              boxShadow: "0 6px 18px rgba(15,23,42,0.05)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "11px",
                minWidth: 0,
              }}
            >
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "999px",
                  background: index === 0 ? "#0f172a" : "#e0f2fe",
                  color: index === 0 ? "#fff" : "#0369a1",
                  display: "grid",
                  placeItems: "center",
                  fontSize: "13px",
                  fontWeight: "900",
                  flexShrink: 0,
                }}
              >
                {index + 1}
              </div>

              <div
                style={{
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: "900",
                    color: "#0f172a",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  #{item.tag}
                </div>

                <div
                  style={{
                    fontSize: "12px",
                    color: "#64748b",
                    marginTop: "2px",
                  }}
                >
                  Trending in Castle X
                </div>
              </div>
            </div>

            <div
              style={{
                fontSize: "12px",
                fontWeight: "800",
                color: "#1d9bf0",
                background: "#eff6ff",
                padding: "6px 9px",
                borderRadius: "999px",
                flexShrink: 0,
              }}
            >
              {item.count} posts
            </div>
          </div>
        </Link>
      ))}
    </div>
  </div>
)}
    <div
      style={{
        padding: "20px",
        borderBottom:
          "1px solid #eff3f4",
      }}
    >
      <Link
        to="/search"
        style={{
          display: "inline-block",
          marginBottom: "15px",
          padding: "10px 18px",
          background: "#1d9bf0",
          color: "#fff",
          textDecoration: "none",
          borderRadius: "9999px",
          fontWeight: "700",
        }}
      >
        🔍 Search Users
      </Link>

      {currentUser?.role === "admin" && (
        <Link
          to="/admin"
          style={{
            display: "inline-block",
            marginLeft: "10px",
            marginBottom: "15px",
            padding: "10px 18px",
            background: "#facc15",
            color: "#000",
            textDecoration: "none",
            borderRadius: "9999px",
            fontWeight: "700",
          }}
        >
          🛡️ Admin Panel
        </Link>
      )}
{canUsePremiumFeature && (
  <div
    style={{
      display: "flex",
      gap: "8px",
      marginBottom: "14px",
    }}
  >
    <button
      onClick={() => setPostMode("post")}
      style={{
        border: "none",
        background: postMode === "post" ? "#1d9bf0" : "#eef2f7",
        color: postMode === "post" ? "#fff" : "#111827",
        padding: "8px 14px",
        borderRadius: "999px",
        cursor: "pointer",
        fontWeight: "800",
      }}
    >
      Post
    </button>

    <button
      onClick={() => setPostMode("poll")}
      style={{
        border: "none",
        background: postMode === "poll" ? "#1d9bf0" : "#eef2f7",
        color: postMode === "poll" ? "#fff" : "#111827",
        padding: "8px 14px",
        borderRadius: "999px",
        cursor: "pointer",
        fontWeight: "800",
      }}
    >
      Poll
    </button>
  </div>
)}
{postMode === "post" ? (
  <textarea
    placeholder="What's happening?"
    value={content}
    onChange={(e) => setContent(e.target.value)}
    style={{
      width: "100%",
      minHeight: "120px",
      border: "none",
      resize: "none",
      outline: "none",
      fontSize: "20px",
    }}
  />
) : (
  <div>
    <textarea
      placeholder="سوال نظرسنجی..."
      value={pollQuestion}
      onChange={(e) => setPollQuestion(e.target.value)}
      style={{
        width: "100%",
        minHeight: "90px",
        border: "1px solid #e5e7eb",
        borderRadius: "16px",
        padding: "14px",
        resize: "none",
        outline: "none",
        fontSize: "18px",
      }}
    />

    {pollOptions.map((option, index) => (
      <input
        key={index}
        value={option}
        onChange={(e) => {
          const nextOptions = [...pollOptions];
          nextOptions[index] = e.target.value;
          setPollOptions(nextOptions);
        }}
        placeholder={`گزینه ${index + 1}`}
        style={{
          width: "100%",
          marginTop: "10px",
          padding: "12px 14px",
          border: "1px solid #e5e7eb",
          borderRadius: "999px",
          outline: "none",
        }}
      />
    ))}

    <div
      style={{
        display: "flex",
        gap: "10px",
        marginTop: "10px",
        flexWrap: "wrap",
      }}
    >
      {pollOptions.length < 4 && (
        <button
          onClick={() => setPollOptions((prev) => [...prev, ""])}
          style={{
            border: "1px solid #cfd9de",
            background: "#fff",
            borderRadius: "999px",
            padding: "8px 12px",
            cursor: "pointer",
            fontWeight: "700",
          }}
        >
          + گزینه
        </button>
      )}

      {pollOptions.length > 2 && (
        <button
          onClick={() => setPollOptions((prev) => prev.slice(0, -1))}
          style={{
            border: "1px solid #fecaca",
            background: "#fff5f5",
            color: "#dc2626",
            borderRadius: "999px",
            padding: "8px 12px",
            cursor: "pointer",
            fontWeight: "700",
          }}
        >
          حذف گزینه
        </button>
      )}

      <select
        value={pollDuration}
        onChange={(e) => setPollDuration(Number(e.target.value))}
        style={{
          border: "1px solid #cfd9de",
          borderRadius: "999px",
          padding: "8px 12px",
          outline: "none",
        }}
      >
        <option value={24}>24 ساعت</option>
        <option value={72}>3 روز</option>
        <option value={168}>7 روز</option>
      </select>
    </div>
  </div>
)}
{postMode === "post" &&
  media &&
        (media.type.startsWith("video") ? (
          <video
            controls
            src={URL.createObjectURL(media)}
            style={{
              width: "100%",
              marginTop: "12px",
              borderRadius: "18px",
            }}
          />
        ) : (
          <img
            src={URL.createObjectURL(media)}
            alt=""
            style={{
              width: "100%",
              marginTop: "12px",
              borderRadius: "18px",
            }}
          />
        ))}

      <div
        style={{
          marginTop: "15px",
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
        }}
      >
{postMode === "post" ? (
  <input
    type="file"
    accept="image/*,video/*"
    onChange={(e) => setMedia(e.target.files[0])}
  />
) : (
  <span
    style={{
      color: "#64748b",
      fontSize: "13px",
      fontWeight: "700",
    }}
  >
    Premium Poll
  </span>
)}

        <button
          onClick={postMode === "post" ? createPost : createPoll}
          disabled={loading}
          style={{
            background: "#1d9bf0",
            color: "#fff",
            border: "none",
            padding: "10px 24px",
            borderRadius: "9999px",
            fontWeight: "700",
            cursor: "pointer",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading
  ? postMode === "post"
    ? "Posting..."
    : "Creating..."
  : postMode === "post"
  ? "Post"
  : "Create Poll"}
        </button>
      </div>
    </div>

<div
  style={{
    opacity: feedSwitching ? 0 : 1,
    transform: feedSwitching ? "translateY(8px)" : "translateY(0)",
    transition: "opacity 0.18s ease, transform 0.18s ease",
  }}
>
 {posts.length === 0 ? (
  <div
    style={{
      padding: "50px",
      textAlign: "center",
      color: "#536471",
    }}
  >
    {postsLoading
      ? "Loading posts..."
      : feedMode === "following"
      ? "No posts from people you follow yet"
      : "No posts yet"}
  </div>
) : (
  <>
    {posts.map((post) => (
      <PostCard
        key={post.id}
        post={post}
      />
    ))}

    {hasMore && (
      <div
        style={{
          padding: "20px",
          textAlign: "center",
        }}
      >
        <button
          onClick={() => loadPosts(feedMode, page + 1, true)}
          disabled={postsLoading}
          style={{
            border: "none",
            background: "#1d9bf0",
            color: "#fff",
            padding: "10px 22px",
            borderRadius: "999px",
            cursor: "pointer",
            fontWeight: "800",
            opacity: postsLoading ? 0.6 : 1,
          }}
        >
          {postsLoading ? "Loading..." : "Load more"}
        </button>
      </div>
    )}
  </>
)}
    </div>
  </div>
</>
);
}