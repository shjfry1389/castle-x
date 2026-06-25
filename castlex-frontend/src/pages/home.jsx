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
const [loading, setLoading] = useState(false);
const token = localStorage.getItem("token");

const currentUser = token
  ? JSON.parse(atob(token.split(".")[1]))
  : null;

const loadPosts = (mode = feedMode) => {
  const token = localStorage.getItem("token");

  const endpoint = mode === "following" ? "/api/posts/following" : "/api/posts";

  api
    .get(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => setPosts(res.data))
    .catch(console.error);
};

useEffect(() => {
  loadPosts(feedMode);

  const channel = supabase
    .channel("posts-feed")
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
    .subscribe();

  return () => {
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
    setPosts((prev) => [res.data.post, ...prev]);
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
    onClick={() => setFeedMode("forYou")}
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
    onClick={() => setFeedMode("following")}
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

      <textarea
        placeholder="What's happening?"
        value={content}
        onChange={(e) =>
          setContent(e.target.value)
        }
        style={{
          width: "100%",
          minHeight: "120px",
          border: "none",
          resize: "none",
          outline: "none",
          fontSize: "20px",
        }}
      />

      {media &&
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
        <input
          type="file"
          accept="image/*,video/*"
          onChange={(e) =>
            setMedia(e.target.files[0])
          }
        />

        <button
          onClick={createPost}
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
          {loading ? "Posting..." : "Post"}
        </button>
      </div>
    </div>

    <div>
      {posts.length === 0 ? (
        <div
          style={{
            padding: "50px",
            textAlign: "center",
            color: "#536471",
          }}
        >
          {feedMode === "following"
  ? "No posts from people you follow yet"
  : "No posts yet"}
        </div>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
          />
        ))
      )}
    </div>
  </div>
</>
);
}