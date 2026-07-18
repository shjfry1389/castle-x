import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";

export default function Hashtags() {
  const [query, setQuery] = useState("");
  const [trendingHashtags, setTrendingHashtags] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const loadTrendingHashtags = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await api.get("/api/hashtags/trending", {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {},
        params: {
          limit: 10,
        },
      });

      setTrendingHashtags(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setTrendingHashtags([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrendingHashtags();
  }, []);

  const openHashtag = (tag = query) => {
    const cleanTag = String(tag || "")
      .replace(/^#/, "")
      .trim();

    if (!cleanTag) return;

    navigate(`/hashtag/${encodeURIComponent(cleanTag)}`);
  };

  return (
    <div
      className="hashtags-page"
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
        className="hashtags-header"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(255,255,255,0.94)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #eff3f4",
          padding: "16px 20px",
        }}
      >
        <Link
          to="/"
          style={{
            display: "inline-block",
            marginBottom: "18px",
            padding: "9px 16px",
            background: "#1d9bf0",
            color: "#fff",
            textDecoration: "none",
            borderRadius: "999px",
            fontWeight: "800",
          }}
        >
          Home
        </Link>

        <h1
          className="hashtags-title"
          style={{
            margin: "0 0 14px",
            fontSize: "28px",
            color: "#0f172a",
          }}
        >
          Hashtags
        </h1>

        <div
          style={{
            display: "flex",
            gap: "10px",
          }}
        >
          <input
            className="hashtags-search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") openHashtag();
            }}
            placeholder="Search hashtag..."
            style={{
              width: "100%",
              minWidth: 0,
              padding: "13px 16px",
              borderRadius: "999px",
              border: "1px solid #dbe3ea",
              outline: "none",
              fontSize: "15px",
            }}
          />

          <button
            onClick={() => openHashtag()}
            style={{
              border: "none",
              background: "#1d9bf0",
              color: "#fff",
              padding: "0 18px",
              borderRadius: "999px",
              fontWeight: "900",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            #
          </button>
        </div>
      </div>

      <div style={{ padding: "18px 20px" }}>
        <div
          className="hashtags-trending-box"
          style={{
            background:
              "linear-gradient(135deg, rgba(29,155,240,0.1), rgba(99,102,241,0.08))",
            border: "1px solid #dbeafe",
            borderRadius: "22px",
            padding: "18px",
            marginBottom: "18px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "14px",
              marginBottom: "14px",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div
                className="hashtags-box-title"
                style={{
                  fontSize: "20px",
                  fontWeight: "950",
                  color: "#0f172a",
                }}
              >
                Trending Now
              </div>

              <div
                className="hashtags-box-subtitle"
                style={{
                  fontSize: "13px",
                  color: "#64748b",
                  marginTop: "4px",
                  fontWeight: "700",
                }}
              >
                Popular topics in Castle X
              </div>
            </div>

            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                background: "#0f172a",
                color: "#fff",
                display: "grid",
                placeItems: "center",
                fontSize: "24px",
                fontWeight: "950",
                flexShrink: 0,
              }}
            >
              #
            </div>
          </div>

          {loading ? (
            <div className="hashtags-empty">Loading hashtags...</div>
          ) : trendingHashtags.length === 0 ? (
            <div className="hashtags-empty">
              هنوز هشتگ ترندی وجود ندارد
            </div>
          ) : (
            <div style={{ display: "grid", gap: "10px" }}>
              {trendingHashtags.map((item, index) => (
                <button
                  className="hashtags-trending-item"
                  key={item.tag}
                  onClick={() => openHashtag(item.tag)}
                  style={{
                    border: "1px solid rgba(226,232,240,0.95)",
                    background: "#fff",
                    borderRadius: "16px",
                    padding: "12px 13px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                    textAlign: "left",
                    boxShadow: "0 8px 22px rgba(15,23,42,0.06)",
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      minWidth: 0,
                    }}
                  >
                    <span
                      className="hashtags-rank"
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "999px",
                        background: index === 0 ? "#1d9bf0" : "#eff6ff",
                        color: index === 0 ? "#fff" : "#1d4ed8",
                        display: "grid",
                        placeItems: "center",
                        fontSize: "13px",
                        fontWeight: "950",
                        flexShrink: 0,
                      }}
                    >
                      {index + 1}
                    </span>

                    <span
                      className="hashtags-tag-name"
                      style={{
                        fontSize: "16px",
                        fontWeight: "950",
                        color: "#0f172a",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      #{item.tag}
                    </span>
                  </div>

                  <span
                    className="hashtags-count-pill"
                    style={{
                      color: "#1d9bf0",
                      background: "#eff6ff",
                      padding: "6px 10px",
                      borderRadius: "999px",
                      fontSize: "12px",
                      fontWeight: "900",
                      flexShrink: 0,
                    }}
                  >
                    {item.count} posts
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}