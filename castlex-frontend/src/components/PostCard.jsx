
import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function PostCard({ post }) {
  const username =
    localStorage.getItem("username");

  const [comments, setComments] =
    useState([]);

  const [commentText, setCommentText] =
    useState("");

  const [showComments, setShowComments] =
    useState(false);

  const [likesCount, setLikesCount] =
    useState(post.likes_count || 0);

  const [liked, setLiked] =
    useState(post.is_liked || false);

  const isPersian = (text) => {
    return /[\u0600-\u06FF]/.test(text);
  };

  const deletePost = async () => {
    const token =
      localStorage.getItem("token");

    if (
      !window.confirm("پست حذف شود؟")
    )
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
        setLikesCount(
          (prev) => prev + 1
        );
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

      setComments(
        Array.isArray(res.data)
          ? res.data
          : []
      );

      setShowComments(
        !showComments
      );
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
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "12px",
        }}
      >
        <Link
          to={`/profile/${post.author?.username}`}
        >
          <img
            src={
              post.author
                ?.avatar_url ||
              "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
            }
            alt=""
            style={{
              width: "48px",
              height: "48px",
              borderRadius:
                "50%",
              objectFit:
                "cover",
            }}
          />
        </Link>

        <div
          style={{ flex: 1 }}
        >
          <div
            style={{
              display: "flex",
              alignItems:
                "center",
              gap: "6px",
            }}
          >
            <Link
              to={`/profile/${post.author?.username}`}
              style={{
                textDecoration:
                  "none",
                color: "inherit",
              }}
            >
              <span
                style={{
                  fontWeight:
                    "700",
                  fontSize:
                    "15px",
                }}
              >
                {post.author
                  ?.display_name ||
                  post.author
                    ?.username}
              </span>
            </Link>

            <Link
              to={`/profile/${post.author?.username}`}
              style={{
                textDecoration:
                  "none",
                color:
                  "#536471",
              }}
            >
              @{post.author?.username}
            </Link>

            {username ===
              post.author
                ?.username && (
              <button
                onClick={
                  deletePost
                }
                style={{
                  marginLeft:
                    "auto",
                  border:
                    "none",
                  background:
                    "none",
                  cursor:
                    "pointer",
                  color:
                    "#f4212e",
                }}
              >
                🗑️
              </button>
            )}
          </div>

          <div
            style={{
              marginTop:
                "6px",
              fontSize:
                "15px",
              lineHeight:
                "1.6",
              whiteSpace:
                "pre-wrap",
              direction:
                isPersian(
                  post.content
                )
                  ? "rtl"
                  : "ltr",
              textAlign:
                isPersian(
                  post.content
                )
                  ? "right"
                  : "left",
            }}
          >
            {post.content
              ?.split(" ")
              .map(
                (
                  word,
                  i
                ) => {
                  if (
                    word.startsWith(
                      "@"
                    )
                  ) {
                    const mentionUser =
                      word.slice(
                        1
                      );

                    return (
                      <Link
                        key={
                          i
                        }
                        to={`/profile/${mentionUser}`}
                        style={{
                          color:
                            "#1d9bf0",
                          fontWeight:
                            "bold",
                          textDecoration:
                            "none",
                        }}
                      >
                        {word}{" "}
                      </Link>
                    );
                  }

                  return (
                    word +
                    " "
                  );
                }
              )}
          </div>

          {post.image_url &&
            post.image_url !==
              "undefined" &&
            post.image_url !==
              "null" && (
              <img
                src={
                  post.image_url
                }
                alt=""
                style={{
                  width:
                    "100%",
                  marginTop:
                    "12px",
                  borderRadius:
                    "18px",
                }}
              />
            )}

          {post.video_url && (
            <video
              controls
              style={{
                width:
                  "100%",
                marginTop:
                  "12px",
                borderRadius:
                  "18px",
              }}
            >
              <source
                src={
                  post.video_url
                }
                type="video/mp4"
              />
            </video>
          )}

          <div
            style={{
              display:
                "flex",
              justifyContent:
                "space-between",
              marginTop:
                "14px",
              maxWidth:
                "420px",
            }}
          >
            <button
              onClick={
                loadComments
              }
            >
              💬{" "}
              {
                post.comments_count
              }
            </button>

            <button
              onClick={
                likePost
              }
            >
              {liked
                ? "❤️"
                : "🤍"}{" "}
              {likesCount}
            </button>

            <button>
              🔁
            </button>

            <button>
              📤
            </button>
          </div>

          {showComments && (
            <div
              style={{
                marginTop:
                  "15px",
              }}
            >
              <div
                style={{
                  display:
                    "flex",
                  gap:
                    "10px",
                }}
              >
                <input
                  value={
                    commentText
                  }
                  onChange={(
                    e
                  ) =>
                    setCommentText(
                      e.target
                        .value
                    )
                  }
                  placeholder="Write a reply..."
                />

                <button
                  onClick={
                    sendComment
                  }
                >
                  Reply
                </button>
              </div>

              {comments.map(
                (
                  comment
                ) => (
                  <div
                    key={
                      comment.id
                    }
                    style={{
                      marginTop:
                        "10px",
                    }}
                  >
                    <Link
                      to={`/profile/${comment.author?.username}`}
                      style={{
                        textDecoration:
                          "none",
                        color:
                          "#1d9bf0",
                        fontWeight:
                          "bold",
                      }}
                    >
                      @
                      {comment
                        .author
                        ?.display_name ||
                        comment
                          .author
                          ?.username}
                    </Link>

                    <div>
                      {
                        comment.content
                      }
                    </div>
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

