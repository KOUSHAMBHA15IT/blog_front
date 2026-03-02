import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { postAPI } from "../api/api";

export default function MyPostsPage() {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    postAPI.getMyPosts().then(setPosts);
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this post?")) return;
    await postAPI.delete(id);
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="my-posts-page">
      <div className="page-header">
        <h1>My Posts</h1>
        <button onClick={() => navigate("/write")}>+ Write New</button>
      </div>
      {posts.length === 0 ? (
        <p>You haven't written anything yet. <Link to="/write">Start writing!</Link></p>
      ) : (
        posts.map(post => (
          <div key={post.id} className="my-post-row">
            <div>
              <Link to={`/post/${post.id}`}><h3>{post.title}</h3></Link>
              <span>{post.category} · {post.likes} likes</span>
            </div>
            <button onClick={() => handleDelete(post.id)}>Delete</button>
          </div>
        ))
      )}
    </div>
  );
}