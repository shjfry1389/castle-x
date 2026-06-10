import { BrowserRouter, Routes, Route } from "react-router-dom";
import Admin from "./pages/Admin";
import Home from "./pages/home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Search from "./pages/Search";
import Messages from "./pages/Messages";
import Chat from "./pages/Chat";
import Notifications from "./pages/Notifications";

function App() {
  return (
    <BrowserRouter>
      {" "}
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
