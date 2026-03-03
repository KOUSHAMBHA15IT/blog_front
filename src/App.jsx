// src/App.jsx
import { useState, useEffect, createContext, useContext } from "react";
import { Routes, Route, Link, useNavigate, useParams, Navigate, Outlet } from "react-router-dom";
import { authAPI, postAPI } from "./api/api.js";

const CATEGORIES = ["All", "Design", "Backend", "CSS", "React", "DevOps"];

function mapPost(p) {
  return {
    ...p,
    author:   p.authorName ?? p.author ?? "Unknown",
    avatar:   (p.authorName ?? p.author ?? "?").slice(0, 2).toUpperCase(),
    date:     p.createdAt
                ? new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                : p.date ?? "",
    readTime: p.content
                ? `${Math.max(1, Math.floor(p.content.split(" ").length / 200))} min`
                : p.readTime ?? "1 min",
  };
}

// ─── Auth Context ─────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("blog_user")) || null; }
    catch { return null; }
  });

  const login = (data) => {
    localStorage.setItem("blog_token", data.token);
    localStorage.setItem("blog_user", JSON.stringify({
      id: data.userId, name: data.name, email: data.email,
    }));
    setUser({ id: data.userId, name: data.name, email: data.email });
  };

  const logout = () => {
    localStorage.removeItem("blog_token");
    localStorage.removeItem("blog_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() { return useContext(AuthContext); }

// ─── Protected Route ──────────────────────────────────────────────────────────
function ProtectedRoute() {
  const { user } = useAuth();
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

// ─── Pen Icon ─────────────────────────────────────────────────────────────────
function PenIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}

// ─── Typewriter Loader ────────────────────────────────────────────────────────
function TypewriterLoader() {
  return (
    <div className="loader-screen">
      <div className="loader-inner">
        <div className="typewriter">
          <div className="slide"><i></i></div>
          <div className="paper"></div>
          <div className="keyboard"></div>
        </div>
        <p className="loader-label">Loading<span className="blink-dots">...</span></p>
      </div>
    </div>
  );
}

// ─── Guest Popup ──────────────────────────────────────────────────────────────
function GuestPopup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Show after 1.5s if guest
  useEffect(() => {
    if (user || dismissed) return;
    const t = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(t);
  }, [user, dismissed]);

  // Re-show after 60s if still guest and not dismissed
  useEffect(() => {
    if (user || dismissed || visible) return;
    const interval = setInterval(() => {
      if (!dismissed && !user) setVisible(true);
    }, 60000);
    return () => clearInterval(interval);
  }, [user, dismissed, visible]);

  const handleDismiss  = () => { setVisible(false); setDismissed(true); };
  const handleLogin    = () => { setVisible(false); navigate("/login"); };
  const handleRegister = () => { setVisible(false); navigate("/register"); };

  if (!visible || user) return null;

  return (
    <div className="guest-popup-overlay" onClick={handleDismiss}>
      <div className="guest-popup" onClick={e => e.stopPropagation()}>
        <button className="guest-popup-close" onClick={handleDismiss}>✕</button>
        <div className="guest-popup-icon">✏️</div>
        <h2 className="guest-popup-title">
          Join <span className="text-orange">The Blog</span>
        </h2>
        <p className="guest-popup-body">
          You're browsing as a guest. Sign in or create a free account to
          read all articles, like posts, and share your own stories.
        </p>
        <div className="guest-popup-stats">
          <div className="guest-popup-stat">
            <span className="guest-popup-stat-num">6+</span>
            <span className="guest-popup-stat-label">Articles</span>
          </div>
          <div className="guest-popup-stat-divider" />
          <div className="guest-popup-stat">
            <span className="guest-popup-stat-num">Free</span>
            <span className="guest-popup-stat-label">Forever</span>
          </div>
          <div className="guest-popup-stat-divider" />
          <div className="guest-popup-stat">
            <span className="guest-popup-stat-num">✍️</span>
            <span className="guest-popup-stat-label">Write Posts</span>
          </div>
        </div>
        <div className="guest-popup-actions">
          <button className="guest-popup-btn-primary" onClick={handleRegister}>
            Create Free Account
          </button>
          <button className="guest-popup-btn-secondary" onClick={handleLogin}>
            Sign In
          </button>
        </div>
        <button className="guest-popup-skip" onClick={handleDismiss}>
          Continue as guest →
        </button>
      </div>
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({ category, setCategory }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="nav-logo">
          <div className="nav-logo-icon"><PenIcon size={15} /></div>
          <span className="nav-logo-text">The Blog</span>
        </Link>

        <div className="nav-categories">
          {CATEGORIES.map(cat => (
            <button key={cat}
              className={`cat-btn ${category === cat ? "active" : ""}`}
              onClick={() => { setCategory(cat); navigate("/"); }}>
              {cat}
            </button>
          ))}
        </div>

        <div className="nav-right">
          {user ? (
            <div style={{ position: "relative" }}>
              <div className="user-chip" onClick={() => setMenuOpen(o => !o)}>
                <div className="user-avatar-small">{user.name.slice(0, 2).toUpperCase()}</div>
                <span className="user-name">{user.name}</span>
              </div>
              {menuOpen && (
                <div className="nav-dropdown">
                  <div className="nav-dropdown-item" onClick={() => { navigate("/write"); setMenuOpen(false); }}>✏️ Write Post</div>
                  <div className="nav-dropdown-item" onClick={() => { navigate("/my-posts"); setMenuOpen(false); }}>📋 My Posts</div>
                  <div className="nav-dropdown-item" onClick={() => { logout(); setMenuOpen(false); navigate("/"); }}>🚪 Logout</div>
                </div>
              )}
            </div>
          ) : (
            <>
              <button className="nav-signin-btn" onClick={() => navigate("/login")}>Sign In</button>
              <button className="nav-signup-btn" onClick={() => navigate("/register")}>Sign Up</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

// ─── Home Page ────────────────────────────────────────────────────────────────
function HomePage({ category }) {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [likedPosts, setLikedPosts] = useState(new Set());
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    setLoading(true);
    setError("");
    postAPI.getAll(category === "All" ? null : category)
      .then(data => setPosts(data.map(mapPost)))
      .catch(() => setError("❌ Cannot reach the backend. Make sure Spring Boot is running on port 8080."))
      .finally(() => setLoading(false));
  }, [category]);

  const filtered = posts.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.author.toLowerCase().includes(search.toLowerCase())
  );

  const featured =
    posts.length > 0
      ? posts.reduce((max, post) => (post.likes || 0) > (max.likes || 0) ? post : max)
      : null;

  const regular =
    category === "All" && !search
      ? filtered.filter(p => p.id !== featured?.id)
      : filtered;

  const handleLike = async (id) => {
    const wasLiked = likedPosts.has(id);
    setLikedPosts(prev => { const n = new Set(prev); wasLiked ? n.delete(id) : n.add(id); return n; });
    try {
      const updated = await postAPI.like(id);
      setPosts(prev => prev.map(p => p.id === id ? mapPost(updated) : p));
    } catch (e) {
      setLikedPosts(prev => { const n = new Set(prev); wasLiked ? n.add(id) : n.delete(id); return n; });
    }
  };

  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <p className="hero-eyebrow">✦ THE BLOG — THOUGHTS ON CODE &amp; DESIGN</p>
          <h1 className="hero-title">Ideas Worth<br /><span className="hero-title-accent">Writing Down.</span></h1>
          <p className="hero-sub">In-depth articles on design, development, and the craft of building great software.</p>
          <div className="hero-search-bar">
            <span className="hero-search-icon">⌕</span>
            <input className="hero-search-input" placeholder="Search articles, authors..."
              value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button className="hero-search-clear" onClick={() => setSearch("")}>✕</button>}
          </div>
          <div className="hero-stats">
            <div className="hero-stat">📝 <span className="hero-stat-val">{posts.length}</span> Articles</div>
            <div className="hero-stat">✍️ <span className="hero-stat-val">{new Set(posts.map(p => p.author)).size}</span> Writers</div>
            <div className="hero-stat">❤️ <span className="hero-stat-val">{posts.reduce((a, p) => a + (p.likes || 0), 0)}</span> Likes</div>
          </div>
        </div>
      </section>

      {featured && category === "All" && !search && (
        <section className="featured-wrap">
          <div className="featured-inner">
            <p className="featured-label">⭐ FEATURED POST</p>
            <div className="featured-card" onClick={() => navigate(`/post/${featured.id}`)}>
              <div className="featured-card-left">
                <span className="cat-chip cat-chip-orange">{featured.category}</span>
                <h2 className="featured-title">{featured.title}</h2>
                <p className="featured-excerpt">{featured.excerpt}</p>
                <div className="featured-meta">
                  <div className="featured-author-row">
                    <div className="avatar">{featured.avatar}</div>
                    <div>
                      <div className="author-name">{featured.author}</div>
                      <div className="author-date">{featured.date} · {featured.readTime} read</div>
                    </div>
                  </div>
                  <button className="btn-primary"
                    onClick={e => { e.stopPropagation(); navigate(`/post/${featured.id}`); }}>
                    Read Article →
                  </button>
                </div>
              </div>
              <div className="featured-card-right">
                <div className="featured-likes-num">{featured.likes}</div>
                <div className="featured-likes-label">LIKES</div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="posts-section">
        <div className="posts-inner">
          <div className="posts-header">
            <h2 className="posts-title">
              {search ? `Results for "${search}"` : category === "All" ? "Latest Articles" : category}
            </h2>
            <span className="posts-count">{filtered.length} {filtered.length === 1 ? "article" : "articles"}</span>
          </div>

          {loading && <div className="loading-wrap"><div className="spinner" /> Loading posts from backend...</div>}
          {error   && <div className="error-box" style={{ padding: 20 }}>{error}</div>}

          {!loading && !error && regular.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <p className="empty-state-text">No articles found.</p>
            </div>
          )}

          {!loading && !error && regular.length > 0 && (
            <div className="posts-grid">
              {regular.map((post, i) => (
                <article key={post.id} className="post-card" style={{ animationDelay: `${i * 60}ms` }}>
                  <div className="post-card-top">
                    <span className="cat-chip">{post.category}</span>
                    <span className="post-read-time">{post.readTime} read</span>
                  </div>
                  <h3 className="post-card-title" onClick={() => navigate(`/post/${post.id}`)}>
                    {post.title}
                  </h3>
                  <p className="post-card-excerpt">{post.excerpt}</p>
                  <div className="post-card-footer">
                    <div className="post-card-author">
                      <div className="avatar">{post.avatar}</div>
                      <div>
                        <div className="author-name">{post.author}</div>
                        <div className="author-date">{post.date}</div>
                      </div>
                    </div>
                    <div className="post-card-actions">
                      <button
                        className={`btn-like ${likedPosts.has(post.id) ? "liked" : ""}`}
                        onClick={() => handleLike(post.id)}>
                        {likedPosts.has(post.id) ? "♥" : "♡"} {post.likes}
                      </button>
                      <button className="btn-read" onClick={() => navigate(`/post/${post.id}`)}>Read →</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {user && !loading && (
            <div className="write-cta">
              <span className="write-cta-text">Got something to share?</span>
              <button className="btn-primary" onClick={() => navigate("/write")}>+ Write a Post</button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

// ─── Post Page ────────────────────────────────────────────────────────────────
function PostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    postAPI.getById(id)
      .then(data => setPost(mapPost(data)))
      .catch(() => setError("Post not found."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleLike = async () => {
    try {
      const updated = await postAPI.like(id);
      setPost(mapPost(updated));
      setLiked(!liked);
    } catch (e) { console.error("Like failed", e); }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await postAPI.delete(id);
      navigate("/");
    } catch (e) { alert("Delete failed. You may not be the author."); }
  };

  if (loading) return <div className="loading-wrap"><div className="spinner" /> Loading...</div>;
  if (error)   return <div className="loading-wrap"><div className="error-box">{error}</div></div>;

  return (
    <div className="post-page">
      <div className="post-page-back">
        <button className="btn-secondary" onClick={() => navigate(-1)}>← Back</button>
      </div>
      <div className="post-page-header">
        <span className="cat-chip cat-chip-orange">{post.category}</span>
        <h1 className="post-page-title">{post.title}</h1>
        <div className="post-page-meta">
          <div className="avatar">{post.avatar}</div>
          <span className="text-bold">{post.author}</span>
          <span className="post-page-meta-dot">·</span>
          <span className="text-muted">{post.date}</span>
          <span className="post-page-meta-dot">·</span>
          <span className="text-muted">{post.readTime} read</span>
        </div>
      </div>
      <div className="post-page-content">
        {post.content.split("\n\n").map((para, i) => <p key={i}>{para}</p>)}
      </div>
      <div className="post-page-actions">
        <button className={`btn-like ${liked ? "liked" : ""}`} onClick={handleLike}>
          {liked ? "♥" : "♡"} {post.likes} Likes
        </button>
        {user && user.email === post.authorEmail && (
          <button className="btn-danger" onClick={handleDelete}>🗑 Delete</button>
        )}
      </div>
    </div>
  );
}

// ─── Login Page ───────────────────────────────────────────────────────────────
function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setErr("Please fill in all fields."); return; }
    setLoading(true);
    setErr("");
    try {
      const data = await authAPI.login(form);
      login(data);
      navigate("/");
    } catch (e) {
      setErr(e.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-logo-wrap"><div className="auth-logo-circle">✏️</div></div>
        <h1 className="auth-main-title">Welcome Back</h1>
        <p className="auth-main-sub">Sign in to continue writing</p>
        <div className="auth-card">
          <div className="auth-card-header">Login</div>
          <div className="auth-card-body">
            {err && <div className="error-box">{err}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-field">
                <label className="form-label">Email</label>
                <div className="input-row">
                  <span className="input-icon">✉</span>
                  <input className="form-input" type="email" placeholder="your@email.com"
                    value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>
              <div className="form-field">
                <label className="form-label">Password</label>
                <div className="input-row">
                  <span className="input-icon">🔒</span>
                  <input className="form-input" type={showPass ? "text" : "password"} placeholder="••••••••"
                    value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                  <button type="button" className="eye-btn" onClick={() => setShowPass(!showPass)}>
                    {showPass ? "🙈" : "👁"}
                  </button>
                </div>
              </div>
              <button type="submit" className="btn-submit-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
            <div className="form-divider" />
            <p className="form-switch-text">
              Don't have an account?{" "}
              <span className="form-switch-link" onClick={() => navigate("/register")}>Sign up</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Register Page ────────────────────────────────────────────────────────────
function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { setErr("Please fill in all fields."); return; }
    if (form.password.length < 6) { setErr("Password must be at least 6 characters."); return; }
    setLoading(true);
    setErr("");
    try {
      const data = await authAPI.register(form);
      login(data);
      navigate("/");
    } catch (e) {
      setErr(e.response?.data?.message || "Registration failed. Email may already be in use.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-logo-wrap"><div className="auth-logo-circle">✏️</div></div>
        <h1 className="auth-main-title">Join The Blog</h1>
        <p className="auth-main-sub">Create your account to start writing</p>
        <div className="auth-card">
          <div className="auth-card-header">Sign Up</div>
          <div className="auth-card-body">
            {err && <div className="error-box">{err}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-field">
                <label className="form-label">Full Name</label>
                <div className="input-row">
                  <span className="input-icon">👤</span>
                  <input className="form-input" placeholder="Your full name"
                    value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
              </div>
              <div className="form-field">
                <label className="form-label">Email</label>
                <div className="input-row">
                  <span className="input-icon">✉</span>
                  <input className="form-input" type="email" placeholder="your@email.com"
                    value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>
              <div className="form-field">
                <label className="form-label">Password</label>
                <div className="input-row">
                  <span className="input-icon">🔒</span>
                  <input className="form-input" type={showPass ? "text" : "password"} placeholder="Min. 6 characters"
                    value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                  <button type="button" className="eye-btn" onClick={() => setShowPass(!showPass)}>
                    {showPass ? "🙈" : "👁"}
                  </button>
                </div>
              </div>
              <button type="submit" className="btn-submit-full" disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>
            <div className="form-divider" />
            <p className="form-switch-text">
              Already have an account?{" "}
              <span className="form-switch-link" onClick={() => navigate("/login")}>Sign In</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Write Page ───────────────────────────────────────────────────────────────
function WritePage() {
  const [form, setForm] = useState({ title: "", excerpt: "", content: "", category: "Design" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.excerpt || !form.content) { setErr("Please fill in all fields."); return; }
    setLoading(true);
    setErr("");
    try {
      const post = await postAPI.create(form);
      navigate(`/post/${post.id}`);
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to publish. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="write-page">
      <div className="write-page-header">
        <h1 className="write-page-title">Write a New Post</h1>
        <button className="btn-secondary" onClick={() => navigate(-1)}>← Cancel</button>
      </div>
      {err && <div className="error-box">{err}</div>}
      <form className="write-form" onSubmit={handleSubmit}>
        <div className="form-field">
          <label className="form-label">Title</label>
          <input className="form-input-bare" placeholder="An interesting title..."
            value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
        </div>
        <div className="form-field">
          <label className="form-label">Short Excerpt</label>
          <input className="form-input-bare" placeholder="One-line summary of your post..."
            value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} />
        </div>
        <div className="form-field">
          <label className="form-label">Category</label>
          <select className="form-select" value={form.category}
            onChange={e => setForm({ ...form, category: e.target.value })}>
            {["Design", "Backend", "CSS", "React", "DevOps"].map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-field">
          <label className="form-label">Content</label>
          <textarea className="form-textarea" placeholder="Write your article here..."
            value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />
        </div>
        <div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Publishing..." : "Publish Post →"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── My Posts Page ────────────────────────────────────────────────────────────
function MyPostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    postAPI.getMyPosts()
      .then(data => setPosts(data.map(mapPost)))
      .catch(() => setError("Failed to load your posts."))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await postAPI.delete(id);
      setPosts(prev => prev.filter(p => p.id !== id));
    } catch (e) { alert("Delete failed."); }
  };

  return (
    <div className="my-posts-page">
      <div className="page-header">
        <h1 className="page-title">My Posts</h1>
        <button className="btn-primary" onClick={() => navigate("/write")}>+ Write New</button>
      </div>
      {loading && <div className="loading-wrap"><div className="spinner" /> Loading...</div>}
      {error   && <div className="error-box">{error}</div>}
      {!loading && !error && posts.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📝</div>
          <p className="empty-state-text">
            You haven't written anything yet.{" "}
            <span className="form-switch-link" onClick={() => navigate("/write")}>Start writing!</span>
          </p>
        </div>
      )}
      {!loading && posts.map(post => (
        <div key={post.id} className="my-post-row">
          <div>
            <div className="my-post-title" onClick={() => navigate(`/post/${post.id}`)}>{post.title}</div>
            <div className="my-post-meta">
              <span className="cat-chip">{post.category}</span>
              &nbsp;· {post.likes} likes · {post.date}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-dark"   onClick={() => navigate(`/post/${post.id}`)}>View</button>
            <button className="btn-danger" onClick={() => handleDelete(post.id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── 404 Page ─────────────────────────────────────────────────────────────────
function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="not-found-page">
      <div className="not-found-card">
        <div className="not-found-header">404</div>
        <div className="not-found-body">
          <div className="not-found-icon">📭</div>
          <h1 className="not-found-title">Page Not Found</h1>
          <p className="not-found-sub">The page you're looking for doesn't exist or has been moved.</p>
          <div className="not-found-actions">
            <button className="btn-primary"   onClick={() => navigate("/")}>← Back to Home</button>
            <button className="btn-secondary" onClick={() => navigate(-1)}>Go Back</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer({ setCategory }) {
  const navigate = useNavigate();
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <div className="footer-logo"><PenIcon size={18} /> The Blog</div>
          <p className="footer-tagline">Thoughts on code, design, and everything in between.</p>
        </div>
        <div className="footer-topics">
          <p className="footer-topics-title">TOPICS</p>
          {CATEGORIES.filter(c => c !== "All").map(c => (
            <span key={c} className="footer-topic-link"
              onClick={() => { setCategory(c); navigate("/"); }}>{c}</span>
          ))}
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 The Blog. Built with React + Spring Boot.</span>
        <span className="text-muted">Made by Koushambha</span>
      </div>
    </footer>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [appLoading, setAppLoading] = useState(true);
  const [category, setCategory] = useState("All");

  useEffect(() => {
    const t = setTimeout(() => setAppLoading(false), 3000);
    return () => clearTimeout(t);
  }, []);

  if (appLoading) return <TypewriterLoader />;

  return (
    <AuthProvider>
      <GuestPopup />                {/* ✅ INSIDE AuthProvider so useAuth() works */}
      <Navbar category={category} setCategory={setCategory} />
      <main>
        <Routes>
          <Route path="/"         element={<HomePage category={category} />} />
          <Route path="/post/:id" element={<PostPage />} />
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/write"    element={<WritePage />} />
            <Route path="/my-posts" element={<MyPostsPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer setCategory={setCategory} />
    </AuthProvider>
  );
}