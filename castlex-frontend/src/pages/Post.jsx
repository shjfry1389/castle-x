import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";

import PostCard from "../components/PostCard";

export default function Post() {
  const { postId } = useParams();

  const [post, setPost] = useState(null);

  useEffect(() => {
    api
      .get(`/api/posts/${postId}`)
      .then((res) => setPost(res.data))
      .catch(console.error);
  }, [postId]);

  if (!post) {
    return <p>در حال بارگذاری...</p>;
  }

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "0 auto",
        padding: "20px",
      }}
    >
      <PostCard post={post} />
    </div>
  );
}