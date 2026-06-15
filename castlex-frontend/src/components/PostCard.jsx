import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function PostCard({ post }) {
  console.log("POST TIME:", post.created_at);
const username =
localStorage.getItem("username");

const [comments, setComments] =
useState([]);

const [commentText, setCommentText] =
useState("");

const [showComments, setShowComments] =
useState(false);
const isPersian = (text) => {

  return /[\u0600-\u06FF]/.test(text);

}; 
const [likesCount, setLikesCount] =
useState(post.likes_count || 0);

const [liked, setLiked] =
useState(post.is_liked || false);

const deletePost = async () => {
const token =
localStorage.getItem("token");


if (!window.confirm("پست حذف شود؟"))
  return;

try {
  await api.delete(
    `/api/posts/${post.id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  window.location.reload();
} catch (err) {
  console.error(err);

  alert("خطا در حذف پست");
}


};

const likePost = async () => {
const token =
localStorage.getItem("token");


if (!token) {
  alert("اول وارد شوید");
  return;
}

try {
  const res = await api.post(
    `/api/posts/${post.id}/like`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (res.data.liked) {
    setLiked(true);
    setLikesCount((prev) => prev + 1);
  } else {
    setLiked(false);
    setLikesCount((prev) =>
      Math.max(0, prev - 1)
    );
  }
} catch (err) {
  console.error(err);
}


};

const loadComments = async () => {
  try {
    const res = await api.get(
      `/api/comments/${post.id}`
    );

    console.log(res.data);

    setComments(
      Array.isArray(res.data)
        ? res.data
        : []
    );

    setShowComments(!showComments);
  } catch (err) {
    console.error(err);
  }
};

const sendComment = async () => {
const token =
localStorage.getItem("token");


if (!token) {
  alert("اول وارد شوید");
  return;
}

try {
  await api.post(
    "/api/comments/create",
    {
      post_id: post.id,
      content: commentText,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  setCommentText("");

  loadComments();
} catch (err) {
  console.error(err);
}


};

return (
<div
style={{
padding: "16px",
borderBottom:
"1px solid #eff3f4",
background: "#fff",
transition: "0.2s",
}}
>
<div
style={{
display: "flex",
gap: "12px",
}}
>
<img
src={
  post.author?.avatar_url ||
   "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
}
alt=""
style={{
width: "48px",
height: "48px",
borderRadius: "50%",
objectFit: "cover",
}}
/>


    <div style={{ flex: 1 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
<Link
  to={`/profile/${post.author?.username}`}
  style={{
    textDecoration: "none",
    color: "inherit",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  }}
>
  <span
    style={{
      fontWeight: "700",
      fontSize: "15px",
      cursor: "pointer",
    }}
  >
    {post.author?.display_name ||
      post.author?.username}
  </span>

  {post.author?.is_verified && (
    <svg
      viewBox="0 0 30 24"
      width="20"
      height="20"
      aria-label="Verified"
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
  )}

  {post.author?.role === "admin" && (
    <svg
      viewBox="0 0 30 24"
      width="20"
      height="20"
      aria-label="Admin"
      style={{
        filter: "drop-shadow(0 0 8px gold)",
      }}
    >
      <path
        fill="#FFD700"
        d="M22.5 12c0 1.1-1.1 2-1.4 3-.3 1.1.1 2.5-.5 3.4-.6.9-2 .9-2.9 1.5-.9.6-1.5 1.9-2.6 2.2-1 .3-2.2-.5-3.3-.5s-2.3.8-3.3.5c-1.1-.3-1.7-1.6-2.6-2.2-.9-.6-2.3-.6-2.9-1.5-.6-.9-.2-2.3-.5-3.4-.3-1-1.4-1.9-1.4-3s1.1-2 1.4-3c.3-1.1-.1-2.5.5-3.4.6-.9 2-.9 2.9-1.5.9-.6 1.5-1.9 2.6-2.2 1-.3 2.2.5 3.3.5s2.3-.8 3.3-.5c1.1.3 1.7 1.6 2.6 2.2.9.6 2.3.6 2.9 1.5.6.9.2 2.3.5 3.4.3 1 1.4 1.9 1.4 3z"
      />
      <path
        fill="#fff"
        d="M10.3 15.3 7.7 12.7l-1.1 1.1 3.7 3.7 7.1-7.1-1.1-1.1z"
      />
    </svg>
  )}

  <span
    style={{
      color: "#536471",
      fontSize: "14px",
      cursor: "pointer",
    }}
  >
    @{post.author?.username}
  </span>
</Link>

        {username ===
          post.author?.username && (
          <button
            onClick={deletePost}
            style={{
              marginLeft: "auto",
              border: "none",
              background: "none",
              cursor: "pointer",
              color: "#f4212e",
            }}
          >
            🗑️
          </button>
        )}
      </div>
<div
  style={{
    marginTop: "6px",
    fontSize: "15px",
    lineHeight: "1.6",
    whiteSpace: "pre-wrap",
    direction: isPersian(post.content)
      ? "rtl"
      : "ltr",
    textAlign: isPersian(post.content)
      ? "right"
      : "left",
  }}
>
  {post.content.split(" ").map((word, i) => {
    if (word.startsWith("@")) {
      const username = word.slice(1);

      return (
        <Link
          key={i}
          to={`/profile/${username}`}
          style={{
            color: "#1d9bf0",
            fontWeight: "bold",
            textDecoration: "none",
          }}
        >
          {word}{" "}
        </Link>
      );
    }

    return word + " ";
  })}
</div>

{post.image_url &&
 post.image_url !== "undefined" &&
 post.image_url !== "null" && (
  <img
   loading="lazy"
    src={post.image_url}
          alt=""
          style={{
            width: "100%",
            marginTop: "12px",
            borderRadius: "18px",
            border:
              "1px solid #eff3f4",
          }}
        />
      )}
      {post.video_url && (
  <video
  preload="metadata"
    controls
    style={{
      width: "100%",
      marginTop: "12px",
      borderRadius: "18px",
      border: "1px solid #eff3f4",
    }}
  >
    <source
      src={post.video_url}
      type="video/mp4"
    />
  </video>
)}
<div
  style={{
    marginTop: "10px",
    fontSize: "12px",
    color: "#536471",
    borderTop: "1px solid #eff3f4",
    paddingTop: "8px",
  }}
>
<div
  style={{
    marginTop: "10px",
    fontSize: "12px",
    color: "#536471",
    textAlign: "left",
  }}
>
  🕒{" "}
  {new Date(post.created_at).toLocaleString(
    "fa-IR",
    {
      timeZone: "Asia/Tehran",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }
  )}
</div>
</div>
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          marginTop: "14px",
          maxWidth: "420px",
        }}
      >
        <button
          onClick={loadComments}
          style={{
            background: "none",
            border: "none",
            color: "#536471",
            cursor: "pointer",
          }}
        >
          💬 {post.comments_count}
        </button>

        <button
          onClick={likePost}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontWeight: "600",
            color: liked
              ? "#f91880"
              : "#536471",
          }}
        >
          {liked ? "❤️" : "🤍"}{" "}
          {likesCount}
        </button>

        <button
          style={{
            background: "none",
            border: "none",
            color: "#536471",
          }}
        >
          🔁
        </button>

        <button
          style={{
            background: "none",
            border: "none",
            color: "#536471",
          }}
        >
          📤
        </button>
      </div>

      {showComments && (
        <div
          style={{
            marginTop: "15px",
            borderTop:
              "1px solid #eff3f4",
            paddingTop: "15px",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "15px",
            }}
          >
            <input
              value={commentText}
              onChange={(e) =>
                setCommentText(
                  e.target.value
                )
              }
              placeholder="Write a reply..."
              style={{
                flex: 1,
                padding: "10px",
                border:
                  "1px solid #ddd",
                borderRadius:
                  "999px",
              }}
            />

            <button
              onClick={sendComment}
              style={{
                background:
                  "#1d9bf0",
                color: "#fff",
                border: "none",
                borderRadius:
                  "999px",
                padding:
                  "10px 18px",
                cursor:
                  "pointer",
              }}
            >
              Reply
            </button>
          </div>

{comments.map(
  (comment) => (
    <div
      key={comment.id}
      style={{
        padding: "10px 0",
        borderBottom:
          "1px solid #f1f5f9",
      }}
    >
      <div
        style={{
          fontWeight: "bold",
          marginBottom: "4px",
        }}
      >
        @ {comment.author?.display_name||
           comment.author?.username}
      </div>

      <div>{comment.content}</div>
    </div>
  )
)}
        </div>
      )}
    </div>
  </div>
</div>


);
}
