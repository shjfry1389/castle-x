import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { SpeedInsights } from "@vercel/speed-insights/next"

export default function Login() {
const [username, setUsername] = useState("");
const [password, setPassword] = useState("");

const login = async () => {
try {
const res = await api.post("/api/auth/login", {
username,
password,
});

  localStorage.setItem(
    "token",
    res.data.token
  );

  await api.put(
    "/api/users/online",
    {},
    {
      headers: {
        Authorization: `Bearer ${res.data.token}`,
      },
    }
  );

  localStorage.setItem(
    "username",
    username
  );

  alert("ورود موفق");
  window.location.href = "/";
} catch (err) {
  alert(
    err.response?.data?.error ||
    "خطا در ورود"
  );
}


};

return (
<div
style={{
minHeight: "100vh",
display: "flex",
justifyContent: "center",
alignItems: "center",
background:
"linear-gradient(135deg,#1d9bf0,#6c63ff)",
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
boxShadow:
"0 10px 30px rgba(0,0,0,0.15)",
}}
>
<h1
style={{
textAlign: "center",
marginBottom: "10px",
color: "#1d9bf0",
}}
>
🏰 Castle X </h1>


    <p
      style={{
        textAlign: "center",
        color: "#666",
        marginBottom: "30px",
      }}
    >
      ورود به حساب کاربری
    </p>

    <input
      placeholder="نام کاربری"
      value={username}
      onChange={(e) =>
        setUsername(e.target.value)
      }
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
      onChange={(e) =>
        setPassword(e.target.value)
      }
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
      onClick={login}
      style={{
        width: "100%",
        padding: "14px",
        border: "none",
        borderRadius: "10px",
        background: "#1d9bf0",
        color: "white",
        fontSize: "16px",
        fontWeight: "bold",
        cursor: "pointer",
      }}
    >
      ورود
    </button>

    <p
      style={{
        textAlign: "center",
        marginTop: "20px",
      }}
    >
      حساب ندارید؟{" "}
      <Link
        to="/register"
        style={{
          color: "#1d9bf0",
          fontWeight: "bold",
        }}
      >
        ثبت نام
      </Link>
    </p>
  </div>
</div>


);
}
