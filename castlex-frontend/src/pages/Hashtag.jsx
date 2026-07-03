import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import PostCard from "../components/PostCard";

export default function Hashtag() {
  const { tag } = useParams();
  const cleanTag = decodeURIComponent(tag || "");
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    api
      .get(`/api/hashtags/${encodeURIComponent(cleanTag)}/posts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          limit: 15,
          page: 1,
        },
      })
      .then((res) => setPosts(Array.isArray(res.data) ? res.data : []))
      .catch(console.error);
  }, [cleanTag]);

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
          zIndex: 100,
          background: "#fff",
          padding: "18px 20px",
          borderBottom: "1px solid #eff3f4",
        }}
      >
        <h2 style={{ margin: 0 }}>#{cleanTag}</h2>
      </div>

      {posts.length === 0 ? (
        <div style={{ padding: "50px", textAlign: "center", color: "#536471" }}>
          پستی با این هشتگ پیدا نشد
        </div>
      ) : (
        posts.map((post) => <PostCard key={post.id} post={post} />)
      )}
    </div>
  );
}