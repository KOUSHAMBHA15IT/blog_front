import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.cardHeader}>404</div>
        <div style={styles.cardBody}>
          <div style={styles.icon}>📭</div>
          <h1 style={styles.title}>Page Not Found</h1>
          <p style={styles.sub}>
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div style={styles.actions}>
            <button style={styles.homeBtn} onClick={() => navigate("/")}>
              ← Back to Home
            </button>
            <button style={styles.backBtn} onClick={() => navigate(-1)}>
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f8f8f8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    fontFamily: "'Outfit', sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: 460,
    border: "2px solid #0d0d0d",
    borderRadius: 4,
    overflow: "hidden",
    boxShadow: "6px 6px 0 #0d0d0d",
    background: "#fff",
  },
  cardHeader: {
    background: "#0d0d0d",
    padding: "16px 28px",
    color: "#E8651A",
    fontSize: 36,
    fontWeight: 900,
    letterSpacing: "-0.03em",
  },
  cardBody: {
    padding: "36px 32px",
    textAlign: "center",
  },
  icon: {
    fontSize: 56,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 800,
    color: "#0d0d0d",
    letterSpacing: "-0.02em",
    marginBottom: 10,
  },
  sub: {
    fontSize: 15,
    color: "#666",
    lineHeight: 1.6,
    marginBottom: 32,
  },
  actions: {
    display: "flex",
    gap: 10,
    justifyContent: "center",
  },
  homeBtn: {
    background: "#E8651A",
    color: "#fff",
    border: "2px solid #0d0d0d",
    borderRadius: 4,
    padding: "11px 22px",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "3px 3px 0 #0d0d0d",
    fontFamily: "'Outfit', sans-serif",
  },
  backBtn: {
    background: "#fff",
    color: "#0d0d0d",
    border: "2px solid #0d0d0d",
    borderRadius: 4,
    padding: "11px 22px",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "3px 3px 0 #0d0d0d",
    fontFamily: "'Outfit', sans-serif",
  },
};