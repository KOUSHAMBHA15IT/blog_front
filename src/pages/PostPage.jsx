import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { postAPI } from "../api/api";
import { useAuth } from "../context/AuthContext";

export default function PostPage() {
  const { id } = useParams();        // gets the :id from URL
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);

  useEffect(() => {
    postAPI.getById(id)
      .then(setPost)
      .catch(() => navigate("/"));
  }, [id]);

  const handleLike = async () => {
    const updated = await postAPI.like(id);
    setPost(updated);
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this post?")) return;
    await postAPI.delete(id);
    navigate("/");
  };

  if (!post) return <div className="loader">Loading...</div>;

  return (
    <div className="post-page">
      <span className="cat-chip">{post.category}</span>
      <h1>{post.title}</h1>
      <div className="post-meta">
        <span>{post.authorName}</span>
        <span>·</span>
        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
      </div>
      <div className="post-content">
        {post.content.split("\n\n").map((para, i) => <p key={i}>{para}</p>)}
      </div>
      <div className="post-actions">
        <button onClick={handleLike}>♥ {post.likes}</button>
        {/* Show delete only if this is the author's post */}
        {user && user.email === post.authorEmail && (
          <button onClick={handleDelete} className="delete-btn">Delete</button>
        )}
      </div>
    </div>
  );
}