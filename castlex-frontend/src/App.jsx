import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import "./theme.css";
import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/home";
import Hashtag from "./pages/Hashtag";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Admin from "./pages/Admin";
import AssistantWidget from "./components/AssistantWidget";
import Search from "./pages/Search";
import Profile from "./pages/Profile";
import Messages from "./pages/Messages";
import Notifications from "./pages/Notifications";
import Chat from "./pages/Chat";
import Post from "./pages/Post";
import Hashtags from "./pages/Hashtags";

function Layout({ darkMode, setDarkMode }) {
  const location = useLocation();

  const hideNavbar =
    location.pathname === "/login" || location.pathname === "/register";
    const hideAssistant =
  hideNavbar || location.pathname.startsWith("/chat");

  return (
    <>

{!hideNavbar && (
  <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
)}

{!hideAssistant && <AssistantWidget />}

      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/admin" element={<Admin />} />

        <Route path="/search" element={<Search />} />

        <Route path="/profile/:username" element={<Profile />} />

        <Route path="/messages" element={<Messages />} />

        <Route path="/notifications" element={<Notifications />} />

        <Route path="/chat/:conversationId" element={<Chat />} />

        <Route path="/post/:postId" element={<Post />} />
        <Route path="/hashtag/:tag" element={<Hashtag />} />
        <Route path="/hashtags" element={<Hashtags />} />
      </Routes>
    </>
  );
}

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");

    document.body.classList.remove("dark", "light");
    document.body.classList.add(darkMode ? "dark" : "light");
  }, [darkMode]);

  return (
    <BrowserRouter>
      <Layout darkMode={darkMode} setDarkMode={setDarkMode} />
    </BrowserRouter>
  );
}


export default App;