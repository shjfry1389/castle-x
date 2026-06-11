import { supabase } from "../supabase";
import { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";

export default function Notifications() {
const [notifications, setNotifications] = useState([]);

const loadNotifications = () => {
const token = localStorage.getItem("token");


api
  .get("/api/notifications", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  .then((res) => {
    setNotifications(res.data);
  })
  .catch(console.error);


};

useEffect(() => {
loadNotifications();


const channel = supabase
  .channel("notifications")
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "notifications",
    },
    () => {
      loadNotifications();
    }
  )
  .subscribe();

return () => {
  supabase.removeChannel(channel);
};


}, []);

const getText = (type) => {
switch (type) {
case "follow":
return "شما را فالو کرد";


  case "like":
    return "پست شما را لایک کرد";

  case "comment":
    return "برای پست شما کامنت گذاشت";

  case "mention":
    return "شما را در یک پست تگ کرد";

  default:
    return "فعالیت جدید";
}


};

return (
<div
style={{
maxWidth: "700px",
margin: "0 auto",
padding: "20px",
}}
>
<h1
style={{
marginBottom: "20px",
color: "#1d9bf0",
}}
>
Notifications </h1>


  {notifications.length === 0 ? (
    <p>نوتیفیکیشنی وجود ندارد</p>
  ) : (
    notifications.map((n) => {
      const card = (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            background: "#fff",
            borderRadius: "14px",
            padding: "14px",
            marginBottom: "12px",
            boxShadow:
              "0 2px 10px rgba(0,0,0,0.08)",
          }}
        >
          <img
            src={
              n.sender?.avatar_url ||
              "https://via.placeholder.com/55"
            }
            alt=""
            style={{
              width: "55px",
              height: "55px",
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />

          <div>
            <div
              style={{
                fontWeight: "bold",
              }}
            >
              {n.sender?.display_name ||
                n.sender?.username ||
                "Unknown User"}
            </div>

            <div
              style={{
                color: "#555",
              }}
            >
              {getText(n.type)}
            </div>
          </div>
        </div>
      );

      if (
        (n.type === "like" ||
          n.type === "comment" ||
          n.type === "mention") &&
        n.post_id
      ) {
        return (
          <Link
            key={n.id}
            to={`/post/${n.post_id}`}
            style={{
              textDecoration: "none",
              color: "inherit",
            }}
          >
            {card}
          </Link>
        );
      }

      return (
        <div key={n.id}>
          {card}
        </div>
      );
    })
  )}
</div>


);
}
