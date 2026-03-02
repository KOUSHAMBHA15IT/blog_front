import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { postAPI } from "../api/api";

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    postAPI.getAll(category === "All" ? null : category)
      .then(setPosts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [category]);

  if (loading) return <div className="loader">Loading posts...</div>;

  return (
    <div className="home-page">
      {/* Category filter */}
      <div className="categories">
        {["All","Design","Backend","CSS","React","DevOps"].map(cat => (
          <button key={cat}
            className={category === cat ? "cat-btn active" : "cat-btn"}
            onClick={() => setCategory(cat)}>
            {cat}
          </button>
        ))}
      </div>

      {/* Post grid */}
      <div className="post-grid">
        {posts.map(post => (
          <article key={post.id} className="post-card"
            onClick={() => navigate(`/post/${post.id}`)}>
            <span className="cat-chip">{post.category}</span>
            <h3>{post.title}</h3>
            <p>{post.excerpt}</p>
            <div className="card-footer">
              <span>{post.authorName}</span>
              <span>{post.likes} likes</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}