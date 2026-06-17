import { Link } from "react-router-dom";
import { supabase } from "../supabase";
import PostCard from "../components/PostCard";
import { useEffect, useState } from "react";
import api from "../services/api";
const role = localStorage.getItem("role");

export default function Home() {
const [posts, setPosts] = useState([]);
const [content, setContent] = useState("");
const [media, setMedia] = useState(null);
const [loading, setLoading] = useState(false);
const token = localStorage.getItem("token");

const currentUser = token
  ? JSON.parse(atob(token.split(".")[1]))
  : null;

const loadPosts = () => {
  const token =
    localStorage.getItem("token");

  api
    .get("/api/posts", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => setPosts(res.data))
    .catch(console.error);
}; 
useEffect(() => {
  loadPosts();

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
        loadPosts();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);

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
  console.log("FILE:", media);
  console.log("NAME:", media?.name);
  console.log("TYPE:", media?.type);
  console.log("SIZE:", media?.size);

  if (!media) {
    throw new Error("No file selected");
  }

  if (media.size > 20 * 1024 * 1024) {
    alert("حجم فایل بیشتر از 20MB است");
    setLoading(false);
    return;
  }

  const mimeType =
    media?.type || "";

  const extension =
    media?.name?.includes(".")
      ? media.name
          .split(".")
          .pop()
          .toLowerCase()
      : mimeType.split("/")[1] ||
        "jpg";

  const fileName =
    `${Date.now()}-${crypto.randomUUID()}.${extension}`;

  const isVideo =
    mimeType.startsWith("video");

  const bucket =
    isVideo ? "videos" : "posts";

  console.log("UPLOADING:", {
    fileName,
    bucket,
    mimeType,
  });

  const { error } =
    await supabase.storage
      .from(bucket)
      .upload(fileName, media);

  if (error) {
    console.error(
      "SUPABASE ERROR:",
      error
    );
    throw error;
  }

  const { data } =
    supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

  console.log(
    "PUBLIC URL:",
    data?.publicUrl
  );

  if (isVideo) {
    videoUrl = data.publicUrl;
  } else {
    imageUrl = data.publicUrl;
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
  setPosts((prev) => [
    res.data.post,
    ...prev,
  ]);
}

} 
catch (err) {
  console.error(err);

  console.log(err.response?.data);

  alert(
    err.response?.data?.error ||
    JSON.stringify(err.response?.data)
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
  <h2
    className="for-you-title"
    style={{
      margin: 0,
      fontWeight: "800",
    }}
  >
    For You
  </h2>
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
        (media.type.startsWith(
          "video"
        ) ? (
          <video
            controls
            src={URL.createObjectURL(
              media
            )}
            style={{
              width: "100%",
              marginTop: "12px",
              borderRadius: "18px",
            }}
          />
        ) : (
          <img
            src={URL.createObjectURL(
              media
            )}
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
            setMedia(
              e.target.files[0]
            )
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
            opacity: loading
              ? 0.6
              : 1,
          }}
        >
          {loading
            ? "Posting..."
            : "Post"}
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
          No posts yet
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
