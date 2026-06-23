import { useState } from "react";
import { Link } from "react-router-dom";

import api from "../services/api";

export default function Register() {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const register = async () => {
    try {
      if (loading) return;

      setLoading(true);

      await api.post("/api/auth/register", {
        username: username.trim(),
        display_name: displayName.trim(),
        password,
      });

      alert("ثبت نام موفق");
      window.location.href = "/login";
    } catch (err) {
      console.error(err.response?.data || err);

      alert(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "خطا در ثبت نام"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg,#1d9bf0,#6c63ff)",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "white",
          padding: "35px",
          borderRadius: "20px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            marginBottom: "10px",
            color: "#1d9bf0",
          }}
        >
          Castle X
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#666",
            marginBottom: "30px",
          }}
        >
          ساخت حساب کاربری
        </p>

        <input
          placeholder="نام کاربری"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") register();
          }}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "10px",
            border: "1px solid #ddd",
            marginBottom: "15px",
            fontSize: "15px",
            boxSizing: "border-box",
          }}
        />

        <input
          placeholder="نام نمایشی"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") register();
          }}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "10px",
            border: "1px solid #ddd",
            marginBottom: "15px",
            fontSize: "15px",
            boxSizing: "border-box",
          }}
        />

        <input
          type="password"
          placeholder="رمز عبور"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") register();
          }}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "10px",
            border: "1px solid #ddd",
            marginBottom: "20px",
            fontSize: "15px",
            boxSizing: "border-box",
          }}
        />

        <button
          onClick={register}
          disabled={loading}
          style={{
            width: "100%",
            padding: "14px",
            border: "none",
            borderRadius: "10px",
            background: loading ? "#93c5fd" : "#1d9bf0",
            color: "white",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "در حال ثبت نام..." : "ثبت نام"}
        </button>

        <p
          style={{
            textAlign: "center",
            marginTop: "20px",
          }}
        >
          قبلاً حساب ساخته‌اید؟{" "}
          <Link
            to="/login"
            style={{
              color: "#1d9bf0",
              fontWeight: "bold",
            }}
          >
            ورود
          </Link>
        </p>
      </div>
    </div>
  );
}