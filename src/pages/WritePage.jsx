import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { postAPI } from "../api/api";

export default function WritePage() {
  const [form, setForm] = useState({
    title: "", excerpt: "", content: "", category: "Design"
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const post = await postAPI.create(form);
      navigate(`/post/${post.id}`);    // redirect to the new post
    } catch (err) {
      setError("Failed to publish. Please try again.");
    }
  };

  return (
    <div className="write-page">
      <h1>Write a New Post</h1>
      {error && <div className="error-box">{error}</div>}
      <form onSubmit={handleSubmit}>
        <label>Title</label>
        <input placeholder="An interesting title..."
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })} />
        <label>Short Excerpt</label>
        <input placeholder="One-line summary..."
          value={form.excerpt}
          onChange={e => setForm({ ...form, excerpt: e.target.value })} />
        <label>Category</label>
        <select value={form.category}
          onChange={e => setForm({ ...form, category: e.target.value })}>
          {["Design","Backend","CSS","React","DevOps"].map(c =>
            <option key={c}>{c}</option>)}
        </select>
        <label>Content</label>
        <textarea rows={12} placeholder="Write your article..."
          value={form.content}
          onChange={e => setForm({ ...form, content: e.target.value })} />
        <button type="submit">Publish Post →</button>
      </form>
    </div>
  );
}