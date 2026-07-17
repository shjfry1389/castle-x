import { useEffect, useRef, useState } from "react";

import { Link } from "react-router-dom";
import api from "../services/api";
function getVisitorKey() {
  let key = localStorage.getItem("castle_x_visitor_key");

  if (!key) {
    key =
      crypto?.randomUUID?.() ||
      `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    localStorage.setItem("castle_x_visitor_key", key);
  }

  return key;
}
function isPremiumActive(user) {
  return (
    user?.premium_plan === "silver" &&
    user?.premium_until &&
    new Date(user.premium_until).getTime() > Date.now()
  );
}

function EyeIcon() {
  
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12s-3.5 6.5-9.5 6.5S2.5 12 2.5 12Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
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
function RepostIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-label="Repost"
    >
      <path
        d="M7 7h9.5c1.4 0 2.5 1.1 2.5 2.5V11"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M16 4l3 3-3 3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17 17H7.5C6.1 17 5 15.9 5 14.5V13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M8 20l-3-3 3-3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function SilverBadge({ size = 16 }) {
  return (
    <svg
      viewBox="0 0 30 24"
      width={size}
      height={size}
      aria-label="Premium"
      style={{
        display: "inline-block",
        flexShrink: 0,
        verticalAlign: "middle",
        filter: "drop-shadow(0 0 3px rgba(156,163,175,0.75))",
      }}
    >
      <path
        fill="#bfc5cf"
        d="M22.5 12c0 1.1-1.1 2-1.4 3-.3 1.1.1 2.5-.5 3.4-.6.9-2 .9-2.9 1.5-.9.6-1.5 1.9-2.6 2.2-1 .3-2.2-.5-3.3-.5s-2.3.8-3.3.5c-1.1-.3-1.7-1.6-2.6-2.2-.9-.6-2.3-.6-2.9-1.5-.6-.9-.2-2.3-.5-3.4-.3-1-1.4-1.9-1.4-3s1.1-2 1.4-3c.3-1.1-.1-2.5.5-3.4.6-.9 2-.9 2.9-1.5.9-.6 1.5-1.9 2.6-2.2 1-.3 2.2.5 3.3.5s2.3-.8 3.3-.5c1.1.3 1.7 1.6 2.6 2.2.9.6 2.3.6 2.9 1.5.6.9.2 2.3.5 3.4.3 1 1.4 1.9 1.4 3z"
      />
      <path
        fill="#111827"
        d="M10.3 15.3 7.7 12.7l-1.1 1.1 3.7 3.7 7.1-7.1-1.1-1.1z"
      />
    </svg>
  );
}
function CommentBadge({ author }) {
  if (author?.role === "admin") {
    return (
      <svg
        viewBox="0 0 24 24"
        width="18"
        height="18"
        aria-label="Admin"
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
    );
  }

  if (author?.is_verified) {
    return (
      <svg viewBox="0 0 24 24" width="18" height="18" aria-label="Verified">
        <path
          fill="#1D9BF0"
          d="M22.5 12c0 1.1-1.1 2-1.4 3-.3 1.1.1 2.5-.5 3.4-.6.9-2 .9-2.9 1.5-.9.6-1.5 1.9-2.6 2.2-1 .3-2.2-.5-3.3-.5s-2.3.8-3.3.5c-1.1-.3-1.7-1.6-2.6-2.2-.9-.6-2.3-.6-2.9-1.5-.6-.9-.2-2.3-.5-3.4-.3-1-1.4-1.9-1.4-3s1.1-2 1.4-3c.3-1.1-.1-2.5.5-3.4.6-.9 2-.9 2.9-1.5.9-.6 1.5-1.9 2.6-2.2 1-.3 2.2.5 3.3.5s2.3-.8 3.3-.5c1.1.3 1.7 1.6 2.6 2.2.9.6 2.3.6 2.9 1.5.6.9.2 2.3.5 3.4.3 1 1.4 1.9 1.4 3z"
        />
        <path
          fill="#fff"
          d="M10.3 15.3 7.7 12.7l-1.1 1.1 3.7 3.7 7.1-7.1-1.1-1.1z"
        />
      </svg>
    );
  }
    if (isPremiumActive(author)) {
    return <SilverBadge size={16} />;
  }
  return null;
}
export default function PostCard({ post }) {
  const username = localStorage.getItem("username");
  const cardRef = useRef(null);
const viewTimerRef = useRef(null);
const sentViewRef = useRef(false);

  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [viewsCount, setViewsCount] = useState(post.views_count || 0);
  const [liked, setLiked] = useState(post.is_liked || false);
  const [repostsCount, setRepostsCount] = useState(post.reposts_count || 0);
const [reposted, setReposted] = useState(post.is_reposted || false);
const [showRepostModal, setShowRepostModal] = useState(false);
const [quoteContent, setQuoteContent] = useState("");
const [repostLoading, setRepostLoading] = useState(false);
useEffect(() => {
  setLiked(!!post.is_liked);
  setLikesCount(post.likes_count || 0);
  setReposted(!!post.is_reposted);
  setRepostsCount(post.reposts_count || 0);
}, [
  post.id,
  post.is_liked,
  post.likes_count,
  post.is_reposted,
  post.reposts_count,
]);
  const [hotRequested, setHotRequested] = useState(false);
  const [poll, setPoll] = useState(null);
const [pollLoading, setPollLoading] = useState(false);
const [boostPreview, setBoostPreview] = useState(null);
const [boostLoading, setBoostLoading] = useState(false);

const storedUser = JSON.parse(localStorage.getItem("user") || "null");

const currentUser = {
  ...storedUser,
  username: storedUser?.username || localStorage.getItem("username"),
  role: storedUser?.role || localStorage.getItem("role"),
  premium_plan: storedUser?.premium_plan || localStorage.getItem("premium_plan"),
  premium_until:
    storedUser?.premium_until || localStorage.getItem("premium_until"),
};

const canUsePremiumFeature = (user) => {
  return isPremiumActive(user) || user?.role === "admin";
};

const canSeeBoostPreview =
  canUsePremiumFeature(currentUser) ||
  (username === post.author?.username &&
    (isPremiumActive(post.author) || post.author?.role === "admin"));

  const postContent = post.content || "";

  const isPersian = (text) => {
    return /[\u0600-\u06FF]/.test(text || "");
  };

  const deletePost = async () => {
    const token = localStorage.getItem("token");

    if (!window.confirm("پست حذف شود؟")) return;

    try {
      await api.delete(`/api/posts/${post.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("خطا در حذف پست");
    }
  };

  const likePost = async () => {
    const token = localStorage.getItem("token");

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
        setLikesCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error(err);
    }
  };
  const submitRepost = async (text = "") => {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("اول وارد شوید");
    return;
  }

  try {
    setRepostLoading(true);

    const res = await api.post(
      `/api/posts/${post.id}/repost`,
      {
        quote_content: text.trim(),
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setReposted(!!res.data.reposted);
    setRepostsCount(res.data.reposts_count || 0);
    setShowRepostModal(false);
    setQuoteContent("");
  } catch (err) {
    console.error(err);
    alert("خطا در ری‌پست");
  } finally {
    setRepostLoading(false);
  }
};

const handleRepostClick = () => {
  if (reposted) {
    submitRepost("");
    return;
  }

  setQuoteContent("");
  setShowRepostModal(true);
};
const requestHotPost = async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("اول وارد شوید");
    return;
  }

  try {
    await api.post(
      `/api/posts/${post.id}/hot-request`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setHotRequested(true);
    alert("درخواست پست داغ برای ادمین ارسال شد");
  } catch (err) {
    console.error(err);
    alert(err.response?.data?.error || "خطا در ارسال درخواست پست داغ");
  }
};

  const loadComments = async () => {
    try {
      const res = await api.get(`/api/comments/${post.id}`);

      setComments(Array.isArray(res.data) ? res.data : []);
      setShowComments(!showComments);
    } catch (err) {
      console.error(err);
    }
  };

  const sendComment = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("اول وارد شوید");
      return;
    }

    if (!commentText.trim()) {
      alert("متن کامنت خالی است");
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

  const deleteComment = async (commentId) => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("اول وارد شوید");
      return;
    }

    if (!window.confirm("کامنت حذف شود؟")) return;

    try {
      await api.delete(`/api/comments/${commentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setComments((prev) =>
        prev.filter((comment) => comment.id !== commentId)
      );
    } catch (err) {
      console.error(err);
      alert("خطا در حذف کامنت");
    }
  };
    const sharePost = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const postUsername = post.author?.username;

    if (!postUsername) {
      alert("اطلاعات نویسنده پست آماده نیست");
      return;
    }

    const postLink = `${window.location.origin}/profile/${encodeURIComponent(
      postUsername
    )}?post=${post.id}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Castle X",
          text: "این پست رو ببین",
          url: postLink,
        });
      } else {
        await navigator.clipboard.writeText(postLink);
        alert("لینک پست کپی شد");
      }
    } catch (err) {
      console.error(err);
    }
  };
  const loadPoll = async () => {
  try {
    if (post.post_type !== "poll") return;

    const token = localStorage.getItem("token");

    const res = await api.get(`/api/polls/post/${post.id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setPoll(res.data);
  } catch (err) {
    console.error(err);
  }
};

const votePoll = async (optionId) => {
  try {
    if (!poll || poll.my_vote_option_id) return;

    const token = localStorage.getItem("token");

    setPollLoading(true);

    await api.post(
      `/api/polls/${poll.id}/vote`,
      {
        option_id: optionId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    await loadPoll();
  } catch (err) {
    console.error(err);
    alert(err.response?.data?.error || "خطا در ثبت رای");
  } finally {
    setPollLoading(false);
  }
};

const loadBoostPreview = async () => {
  try {
    const token = localStorage.getItem("token");

    setBoostLoading(true);

    const res = await api.get(`/api/posts/${post.id}/boost-preview`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setBoostPreview(res.data);
  } catch (err) {
    console.error(err);
    alert(err.response?.data?.error || "خطا در دریافت پیش‌بینی بوست");
  } finally {
    setBoostLoading(false);
  }
};

useEffect(() => {
  loadPoll();
}, [post.id, post.post_type]);
    useEffect(() => {
    if (!post.id || !cardRef.current) return;

    const sendView = async () => {
      if (sentViewRef.current) return;

      sentViewRef.current = true;

      try {
        const token = localStorage.getItem("token");

        const res = await api.post(
          `/api/posts/${post.id}/view`,
          {
            visitor_key: getVisitorKey(),
          },
          {
            headers: token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {},
          }
        );
if (typeof res.data?.views_count === "number") {
  const isAdminPost = post.author?.role === "admin";
  setViewsCount(isAdminPost ? res.data.views_count + 200 : res.data.views_count);
}
      } catch (err) {
        sentViewRef.current = false;
        console.error(err);
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
          viewTimerRef.current = setTimeout(sendView, 2000);
        } else if (viewTimerRef.current) {
          clearTimeout(viewTimerRef.current);
        }
      },
      {
        threshold: [0, 0.25, 1],
      }
    );

    observer.observe(cardRef.current);

    return () => {
      observer.disconnect();

      if (viewTimerRef.current) {
        clearTimeout(viewTimerRef.current);
      }
    };
  }, [post.id]);

return (
  <div
    ref={cardRef}
    id={`post-${post.id}`}
    style={{
        padding: "16px",
        borderBottom: "1px solid #eff3f4",
        background: "#fff",
        transition: "0.2s",
      }}
    >
{post.reposted_by && (
  <div
    style={{
      marginBottom: "10px",
      marginLeft: "60px",
      color: "#536471",
      fontSize: "13px",
      fontWeight: "600",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "5px",
        marginBottom: post.quote_content ? "8px" : "0",
      }}
    >
      <RepostIcon size={14} />
      {post.reposted_by.display_name || post.reposted_by.username} reposted
    </div>

    {post.quote_content && (
      <div
        style={{
          color: "#0f172a",
          fontSize: "15px",
          fontWeight: "500",
          lineHeight: "1.8",
          whiteSpace: "pre-wrap",
        }}
      >
        {post.quote_content}
      </div>
    )}
  </div>
)}
{showRepostModal && (
  <div
    onClick={() => setShowRepostModal(false)}
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(15, 23, 42, 0.45)",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "18px",
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        width: "100%",
        maxWidth: "440px",
        background: "#fff",
        borderRadius: "22px",
        padding: "18px",
        boxShadow: "0 24px 70px rgba(0,0,0,0.25)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "14px",
        }}
      >
        <b style={{ fontSize: "18px" }}>Repost</b>

        <button
          onClick={() => setShowRepostModal(false)}
          style={{
            border: "none",
            background: "#f1f5f9",
            width: "34px",
            height: "34px",
            borderRadius: "50%",
            cursor: "pointer",
            fontSize: "18px",
          }}
        >
          ×
        </button>
      </div>

      <textarea
        value={quoteContent}
        onChange={(e) => setQuoteContent(e.target.value)}
        placeholder="متنی که می‌خواهید بالای ری‌پست نوشته شود..."
        rows={4}
        style={{
          width: "100%",
          resize: "none",
          border: "1px solid #dbe3ea",
          borderRadius: "16px",
          padding: "12px",
          outline: "none",
          fontSize: "15px",
          lineHeight: "1.7",
          boxSizing: "border-box",
        }}
      />

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginTop: "14px",
        }}
      >
        <button
          onClick={() => submitRepost("")}
          disabled={repostLoading}
          style={{
            flex: 1,
            border: "1px solid #cfd9de",
            background: "#fff",
            color: "#0f172a",
            padding: "11px",
            borderRadius: "999px",
            cursor: repostLoading ? "not-allowed" : "pointer",
            fontWeight: "800",
          }}
        >
          بدون متن
        </button>

        <button
          onClick={() => submitRepost(quoteContent)}
          disabled={repostLoading}
          style={{
            flex: 1,
            border: "none",
            background: "#00ba7c",
            color: "#fff",
            padding: "11px",
            borderRadius: "999px",
            cursor: repostLoading ? "not-allowed" : "pointer",
            fontWeight: "800",
          }}
        >
          {repostLoading ? "..." : "Repost"}
        </button>
      </div>
    </div>
  </div>
)}
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
              to={`/profile/${encodeURIComponent(post.author?.username || "")}`}
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
                {post.author?.display_name || post.author?.username}
              </span>

              {post.author?.is_verified && (
                <svg viewBox="0 0 30 24" width="20" height="20" aria-label="Verified">
                  <path
                    fill="#1D9BF0"
                    d="M22.5 12c0 1.1-1.1 2-1.4 3-.3 1.1.1 2.5-.5 3.4-.6.9-2 .9-2.9 1.5-.9.6-1.5 1.9-2.6 2.2-1 .3-2.2-.5-3.3-.5s-2.3.8-3.3.5c-1.1-.3-1.7-1.6-2.6-2.2-.9-.6-2.3-.6-2.9-1.5-.6-.9-.2-2.3-.5-3.4-.3-1-1.4-1.9-1.4-3s1.1-2 1.4-3c.3-1.1-.1-2.5.5-3.4.6-.9 2-.9 2.9-1.5.9-.6 1.5-1.9 2.6-2.2 1-.3 2.2.5 3.3.5s2.3-.8 3.3-.5c1.1.3 1.7 1.6 2.6 2.2.9.6 2.3.6 2.9 1.5.6.9.2 2.3.5 3.4.3 1 1.4 1.9 1.4 3z"
                  />
                  <path fill="#fff" d="M10.3 15.3 7.7 12.7l-1.1 1.1 3.7 3.7 7.1-7.1-1.1-1.1z" />
                </svg>
              )}
              {post.author?.role !== "admin" &&
  !post.author?.is_verified &&
  isPremiumActive(post.author) && <SilverBadge size={20} />}
              {post.author?.role === "admin" && (
                <svg
                  viewBox="0 0 30 24"
                  width="20"
                  height="20"
                  aria-label="Admin"
                  style={{ filter: "drop-shadow(0 0 8px gold)" }}
                >
                  <path
                    fill="#FFD700"
                   d="M22.5 12c0 1.1-1.1 2-1.4 3-.3 1.1.1 2.5-.5 3.4-.6.9-2 .9-2.9 1.5-.9.6-1.5 1.9-2.6 2.2-1 .3-2.2-.5-3.3-.5s-2.3.8-3.3.5c-1.1-.3-1.7-1.6-2.6-2.2-.9-.6-2.3-.6-2.9-1.5-.6-.9-.2-2.3-.5-3.4-.3-1-1.4-1.9-1.4-3s1.1-2 1.4-3c.3-1.1-.1-2.5.5-3.4.6-.9 2-.9 2.9-1.5.9-.6 1.5-1.9 2.6-2.2 1-.3 2.2.5 3.3.5s2.3-.8 3.3-.5c1.1.3 1.7 1.6 2.6 2.2.9.6 2.3.6 2.9 1.5.6.9.2 2.3.5 3.4.3 1 1.4 1.9 1.4 3z"
                  />
                  <path fill="#fff" d="M10.3 15.3 7.7 12.7l-1.1 1.1 3.7 3.7 7.1-7.1-1.1-1.1z" />
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

            {username === post.author?.username && (
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
                    {post.is_hot && (
            <div
              style={{
                display: "inline-flex",
                marginTop: "8px",
                marginBottom: "4px",
                padding: "5px 10px",
                borderRadius: "999px",
                background: "linear-gradient(135deg,#f59e0b,#ef4444)",
                color: "#fff",
                fontSize: "12px",
                fontWeight: "800",
              }}
            >
              پست داغ
            </div>
          )}
          <div
            style={{
              marginTop: "6px",
              fontSize: "15px",
              lineHeight: "1.6",
              whiteSpace: "pre-wrap",
              direction: isPersian(postContent) ? "rtl" : "ltr",
              textAlign: isPersian(postContent) ? "right" : "left",
            }}
          >
            {postContent.split(/(\s+|@[a-zA-Z0-9_.-]+|#[\p{L}\p{N}_]+)/gu).map((part, i) => {
  if (!part) return null;

  if (/^@[a-zA-Z0-9_.-]+$/.test(part)) {
    const mentionedUsername = part.slice(1);

    return (
      <Link
        key={i}
        to={`/profile/${encodeURIComponent(mentionedUsername)}`}
        style={{
          color: "#1d9bf0",
          fontWeight: "bold",
          textDecoration: "none",
        }}
      >
        {part}
      </Link>
    );
  }
    if (/^#[\p{L}\p{N}_]+$/u.test(part)) {
    const hashtag = part.slice(1);

    return (
      <Link
        key={i}
        to={`/hashtag/${encodeURIComponent(hashtag)}`}
        style={{
          color: "#1d9bf0",
          fontWeight: "bold",
          textDecoration: "none",
        }}
      >
        {part}
      </Link>
    );
  }

  return part;
})}
          </div>
          {post.post_type === "poll" && poll && (
  <div
    style={{
      marginTop: "14px",
      padding: "14px",
      border: "1px solid #e5e7eb",
      borderRadius: "16px",
      background: "#f8fafc",
    }}
  >
    <div style={{ fontWeight: "800", marginBottom: "12px" }}>
      📊 {poll.question}
    </div>

    {poll.options.map((option) => {
      const percent =
        poll.total_votes > 0
          ? Math.round((option.votes_count / poll.total_votes) * 100)
          : 0;

      const selected = poll.my_vote_option_id === option.id;

      return (
        <button
          key={option.id}
          onClick={() => votePoll(option.id)}
          disabled={pollLoading || !!poll.my_vote_option_id}
          style={{
            width: "100%",
            marginBottom: "10px",
            padding: "11px 12px",
            borderRadius: "12px",
            border: selected ? "2px solid #1d9bf0" : "1px solid #cfd9de",
            background: selected ? "#e0f2fe" : "#fff",
            cursor: poll.my_vote_option_id ? "default" : "pointer",
            textAlign: "left",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              width: `${percent}%`,
              background: "rgba(29,155,240,0.16)",
            }}
          />

          <span
            style={{
              position: "relative",
              zIndex: 2,
              display: "flex",
              justifyContent: "space-between",
              fontWeight: "700",
            }}
          >
            <span>{option.option_text}</span>
            <span>{percent}%</span>
          </span>
        </button>
      );
    })}

    <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
      {poll.total_votes || 0} رای
    </div>
  </div>
)}
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
                  border: "1px solid #eff3f4",
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
              <source src={post.video_url} type="video/mp4" />
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
              {new Date(post.created_at + "Z").toLocaleString("fa-IR", {
                timeZone: "Asia/Tehran",
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
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
                transition: "transform 0.18s ease, color 0.18s ease",
transform: showComments ? "scale(1.06)" : "scale(1)",
color: showComments ? "#1d9bf0" : "#536471",
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
                color: liked ? "#f91880" : "#536471",
                transition: "transform 0.18s ease, color 0.18s ease",
transform: liked ? "scale(1.08)" : "scale(1)",
              }}
            >
              {liked ? "❤️" : "🤍"} {likesCount}
            </button>
                        <button
              onClick={handleRepostClick}
disabled={repostLoading}
              title="Repost"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontWeight: "600",
                color: reposted ? "#00ba7c" : "#536471",
                transition: "transform 0.18s ease, color 0.18s ease",
                transform: reposted ? "scale(1.08)" : "scale(1)",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <RepostIcon size={18} />
              {repostsCount}
            </button>
            <div
  style={{
    color: "#536471",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    gap: "5px",
  }}
>
  <EyeIcon />
  {viewsCount}
</div>
{canSeeBoostPreview && (
  <button
    onClick={loadBoostPreview}
    disabled={boostLoading}
    style={{
      border: "none",
      background: "transparent",
      cursor: boostLoading ? "not-allowed" : "pointer",
      color: "#1d9bf0",
      fontWeight: "800",
    }}
  >
    🚀 {boostLoading ? "..." : "Boost"}
  </button>
)}
{username === post.author?.username &&
  isPremiumActive(post.author) &&
  !post.is_hot && (
    <button
      onClick={requestHotPost}
      disabled={hotRequested}
      title="Request hot post"
      style={{
        background: hotRequested ? "#e5e7eb" : "#fff7ed",
        border: "1px solid #fdba74",
        color: hotRequested ? "#64748b" : "#ea580c",
        borderRadius: "999px",
        padding: "6px 10px",
        cursor: hotRequested ? "default" : "pointer",
        fontWeight: "700",
      }}
    >
      {hotRequested ? "Requested" : "Hot Request"}
    </button>
  )}
<button
  onClick={sharePost}
  title="Share post"
  style={{
    background: "none",
    border: "none",
    color: "#536471",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "5px",
  }}
>
  <ShareIcon />
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

         {boostPreview && (
  <div
    style={{
      marginTop: "12px",
      padding: "14px",
      borderRadius: "16px",
      background: "linear-gradient(135deg,#eff6ff,#f8fafc)",
      border: "1px solid #bfdbfe",
      color: "#0f172a",
    }}
  >
    <b>پیش‌بینی بوست</b>

    <div style={{ marginTop: "8px", fontSize: "14px" }}>
      ویو احتمالی:{" "}
      <b>
        {boostPreview.preview.estimated_min_views} تا{" "}
        {boostPreview.preview.estimated_max_views}
      </b>
    </div>

    <div style={{ marginTop: "5px", fontSize: "14px" }}>
      لایک احتمالی اضافه: <b>{boostPreview.preview.expected_extra_likes}</b>
    </div>

    <div style={{ marginTop: "5px", fontSize: "14px" }}>
      کامنت احتمالی اضافه: <b>{boostPreview.preview.expected_extra_comments}</b>
    </div>

    <p style={{ margin: "8px 0 0", color: "#64748b", fontSize: "12px" }}>
      {boostPreview.note}
    </p>
  </div>
)}
<div
  style={{
    marginTop: showComments ? "15px" : "0",
    borderTop: showComments ? "1px solid #eff3f4" : "1px solid transparent",
    paddingTop: showComments ? "15px" : "0",
    maxHeight: showComments ? "2000px" : "0",
    opacity: showComments ? 1 : 0,
    overflow: "hidden",
    transition:
      "max-height 0.28s ease, opacity 0.22s ease, margin-top 0.22s ease, padding-top 0.22s ease",
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
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a reply..."
                  style={{
                    flex: 1,
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "999px",
                  }}
                />

                <button
                  onClick={sendComment}
                  style={{
                    background: "#1d9bf0",
                    color: "#fff",
                    border: "none",
                    borderRadius: "999px",
                    padding: "10px 18px",
                    cursor: "pointer",
                  }}
                >
                  Reply
                </button>
              </div>

             {comments.map((comment) => (
  <div
    key={comment.id}
    style={{
      display: "flex",
      gap: "10px",
      padding: "12px",
      marginBottom: "10px",
      background: "#f8fafc",
      border: "1px solid #e5e7eb",
      borderRadius: "14px",
    }}
  >
    <Link
      to={`/profile/${encodeURIComponent(comment.author?.username || "")}`}
      style={{ flexShrink: 0 }}
    >
      <img
        src={
          comment.author?.avatar_url ||
          "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
        }
        alt=""
        style={{
          width: "38px",
          height: "38px",
          borderRadius: "50%",
          objectFit: "cover",
        }}
      />
    </Link>

    <div style={{ flex: 1, minWidth: 0 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "10px",
          alignItems: "flex-start",
        }}
      >
        <Link
          to={`/profile/${encodeURIComponent(comment.author?.username || "")}`}
          style={{
            color: "inherit",
            textDecoration: "none",
            minWidth: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              flexWrap: "wrap",
            }}
          >
            <b>
              {comment.author?.display_name || comment.author?.username}
            </b>

            <CommentBadge author={comment.author} />

            <span
              style={{
                color: "#536471",
                fontSize: "13px",
              }}
            >
              @{comment.author?.username}
            </span>
          </div>
        </Link>

        {comment.author?.username === username && (
          <button
            onClick={() => deleteComment(comment.id)}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: "#f4212e",
              fontSize: "16px",
            }}
          >
            حذف
          </button>
        )}
      </div>

      <div
        style={{
          marginTop: "6px",
          fontSize: "14px",
          lineHeight: "1.6",
          whiteSpace: "pre-wrap",
        }}
      >
        {comment.content}
      </div>
    </div>
  </div>
))}
            </div>
          
        </div>
      </div>
    </div>
  );
}