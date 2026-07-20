import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Badge({ user }) {
  if (user?.role === "admin") {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "18px",
          height: "18px",
          borderRadius: "50%",
          background: "linear-gradient(135deg,#facc15,#f59e0b)",
          color: "#fff",
          fontSize: "11px",
          fontWeight: "900",
        }}
      >
        ✓
      </span>
    );
  }

  if (user?.is_verified) {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "18px",
          height: "18px",
          borderRadius: "50%",
          background: "#1d9bf0",
          color: "#fff",
          fontSize: "11px",
          fontWeight: "900",
        }}
      >
        ✓
      </span>
    );
  }

  const premiumActive =
    user?.premium_plan === "silver" &&
    user?.premium_until &&
    new Date(user.premium_until).getTime() > Date.now();

  if (premiumActive) {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "18px",
          height: "18px",
          borderRadius: "50%",
          background: "linear-gradient(135deg,#e5e7eb,#94a3b8)",
          color: "#111827",
          fontSize: "11px",
          fontWeight: "900",
        }}
      >
        ✓
      </span>
    );
  }

  return null;
}

function UserRow({ item, index }) {
  const user = item.user;

  return (
    <Link
      to={`/profile/${encodeURIComponent(user?.username || "")}`}
      style={{
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "14px 0",
          borderBottom: "1px solid #eff3f4",
        }}
      >
        <div
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "50%",
            background:
              index === 0
                ? "linear-gradient(135deg,#facc15,#f97316)"
                : index === 1
                  ? "linear-gradient(135deg,#e5e7eb,#94a3b8)"
                  : index === 2
                    ? "linear-gradient(135deg,#f59e0b,#92400e)"
                    : "#f1f5f9",
            color: index < 3 ? "#fff" : "#0f172a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "900",
          }}
        >
          {index + 1}
        </div>

        <img
          src={
            user?.avatar_url ||
            "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
          }
          alt=""
          style={{
            width: "52px",
            height: "52px",
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontWeight: "900",
            }}
          >
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user?.display_name || user?.username}
            </span>
            <Badge user={user} />
          </div>

          <div
            style={{
              color: "#536471",
              fontSize: "14px",
            }}
          >
            @{user?.username}
          </div>
        </div>

        <div
          style={{
            textAlign: "right",
            fontSize: "13px",
            color: "#536471",
          }}
        >
          <b
            style={{
              display: "block",
              color: "#0f172a",
              fontSize: "16px",
            }}
          >
            {item.score}
          </b>
          امتیاز
        </div>
      </div>
    </Link>
  );
}

function PostRankCard({ post, index, label, color }) {
  return (
    <Link
      to={`/profile/${encodeURIComponent(post.author?.username || "")}?post=${post.id}`}
      style={{
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <div
        style={{
          padding: "14px",
          border: "1px solid #eff3f4",
          borderRadius: "16px",
          marginBottom: "10px",
          background: "#fff",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "8px",
          }}
        >
          <span
            style={{
              background: color,
              color: "#fff",
              borderRadius: "999px",
              padding: "4px 9px",
              fontSize: "12px",
              fontWeight: "900",
            }}
          >
            #{index + 1}
          </span>

          <b>{post.author?.display_name || post.author?.username}</b>
          <Badge user={post.author} />
        </div>

        <div
          style={{
            color: "#0f172a",
            lineHeight: "1.7",
            whiteSpace: "pre-wrap",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {post.content || "پست بدون متن"}
        </div>

        <div
          style={{
            marginTop: "10px",
            color: "#536471",
            fontSize: "13px",
            fontWeight: "700",
          }}
        >
          {label}
        </div>
      </div>
    </Link>
  );
}

export default function Rankings() {
  const navigate = useNavigate();
  const [rankings, setRankings] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadRankings = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/api/rankings/weekly", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setRankings(res.data);
    } catch (err) {
      console.error(err);
      alert("خطا در دریافت رتبه‌بندی");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRankings();
  }, []);

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
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: "#fff",
          padding: "16px 20px",
          borderBottom: "1px solid #eff3f4",
        }}
      >
        <button
          onClick={() => navigate("/")}
          style={{
            border: "none",
            background: "#1d9bf0",
            color: "#fff",
            padding: "9px 16px",
            borderRadius: "999px",
            cursor: "pointer",
            fontWeight: "900",
            marginBottom: "14px",
          }}
        >
          Home
        </button>

        <h1
          style={{
            margin: 0,
            fontSize: "28px",
          }}
        >
          Weekly Rankings
        </h1>

        <p
          style={{
            margin: "6px 0 0",
            color: "#536471",
          }}
        >
         Castle X رتبه‌بندی هفتگی کاربران و پست‌های 
        </p>
        <div
  style={{
    marginTop: "14px",
    padding: "12px 14px",
    borderRadius: "16px",
    background: "linear-gradient(135deg,#eff6ff,#f8fafc)",
    border: "1px solid #dbeafe",
    color: "#334155",
    fontSize: "13px",
    lineHeight: "1.8",
  }}
>
  <b
    style={{
      display: "block",
      color: "#0f172a",
      marginBottom: "4px",
    }}
  >
    نحوه محاسبه امتیاز
  </b>

  <span>
    هر ویو = ۱ امتیاز، هر لایک = ۴ امتیاز، هر کامنت = ۶ امتیاز و هر ری‌پست = ۸ امتیاز.
  </span>
</div>
      </div>

      {loading ? (
        <div style={{ padding: "40px", textAlign: "center" }}>Loading...</div>
      ) : (
        <div style={{ padding: "18px 20px" }}>
          <section style={{ marginBottom: "28px" }}>
            <h2 style={{ marginBottom: "10px" }}>Top Creators</h2>

            {(rankings?.topCreators || []).length === 0 ? (
              <p style={{ color: "#536471" }}>هنوز رتبه‌ای ثبت نشده</p>
            ) : (
              rankings.topCreators.map((item, index) => (
                <UserRow key={item.user.id} item={item} index={index} />
              ))
            )}
          </section>

          <section style={{ marginBottom: "28px" }}>
            <h2>پرلایک‌ترین پست‌ها</h2>
            {(rankings?.topLikedPosts || []).map((post, index) => (
              <PostRankCard
                key={post.id}
                post={post}
                index={index}
                label={`${post.likes_count} لایک`}
                color="#ec4899"
              />
            ))}
          </section>

          <section style={{ marginBottom: "28px" }}>
            <h2>پرکامنت‌ترین پست‌ها</h2>
            {(rankings?.topCommentedPosts || []).map((post, index) => (
              <PostRankCard
                key={post.id}
                post={post}
                index={index}
                label={`${post.comments_count} کامنت`}
                color="#8b5cf6"
              />
            ))}
          </section>

          <section style={{ marginBottom: "28px" }}>
            <h2>پربازدیدترین پست‌ها</h2>
            {(rankings?.topViewedPosts || []).map((post, index) => (
              <PostRankCard
                key={post.id}
                post={post}
                index={index}
                label={`${post.views_count} ویو`}
                color="#0ea5e9"
              />
            ))}
          </section>

          <section>
            <h2>پری‌پست‌ترین پست‌ها</h2>
            {(rankings?.topRepostedPosts || []).map((post, index) => (
              <PostRankCard
                key={post.id}
                post={post}
                index={index}
                label={`${post.reposts_count} ری‌پست`}
                color="#10b981"
              />
            ))}
          </section>
        </div>
      )}
    </div>
  );
}