const auth = require("./middleware/auth");
const admin = require("./middleware/admin");
const jwt = require("jsonwebtoken");
const express = require("express");
const cors = require("cors");

const bcrypt = require("bcrypt");
require("dotenv").config();

const supabase = require("./supabase");

const app = express();


app.use(
  cors({
    origin: [
      "https://castle-x.vercel.app",
      "https://castle-x-frontend.vercel.app"
    ],
    credentials: true,
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    app: "Castle X",
    status: "online",
  });
});

// ثبت نام
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, display_name, password } = req.body;

    if (!username || !display_name || !password) {
      return res.status(400).json({
        error: "همه فیلدها الزامی هستند",
      });
    }

    const { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .ilike("username", username)
      .single();

    if (existingUser) {
      return res.status(400).json({
        error: "این نام کاربری قبلا ثبت شده است",
      });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          username,
          display_name,
          password_hash,
        },
      ])
      .select();

    if (error) {
      return res.status(500).json(error);
    }

    res.json({
      success: true,
      user: data[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "خطای سرور",
    });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .ilike("username", username)
      .single();

    if (error || !user) {
      return res.status(400).json({
        error: "نام کاربری یا رمز اشتباه است",
      });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(400).json({
        error: "نام کاربری یا رمز اشتباه است",
      });
    }
    if (user.banned) {
      return res.status(403).json({
        error: "حساب شما توسط ادمین مسدود شده است",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "30d",
      },
    );
    await supabase
      .from("users")
      .update({
        is_online: true,
        last_seen: new Date(),
      })
      .eq("id", user.id);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        display_name: user.display_name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "خطای سرور",
    });
  }
});
const PORT = process.env.PORT || 5000;
app.get("/api/admin/dashboard", auth, admin, async (req, res) => {
  res.json({
    success: true,
    message: "به پنل ادمین Castle X خوش آمدید",
    admin: req.user.username,
  });
});
app.post("/api/posts/create", auth, async (req, res) => {
  try {
    const { content, image_url, video_url } = req.body;

    if (!content && !image_url && !video_url) {
      return res.status(400).json({
        error: "پست خالی است",
      });
    }

    const { data, error } = await supabase
      .from("posts")
      .insert([
        {
          user_id: req.user.id,
          content,
          image_url,
          video_url,
        },
      ])
      .select()
      .single();

    if (error) {
      return res.status(500).json(error);
    }

    // پیدا کردن منشن ها
    const mentions =
      content?.match(/@([a-zA-Z0-9_]+)/g) || [];

    for (const mention of mentions) {
      const username = mention.replace("@", "");

      const { data: user } = await supabase
        .from("users")
        .select("id")
        .ilike("username", username)
        .single();

      if (
        user &&
        user.id !== req.user.id
      ) {
        await supabase
          .from("notifications")
          .insert([
            {
              user_id: user.id,
              sender_id: req.user.id,
              type: "mention",
              post_id: data.id,
            },
          ]);
      }
    }

    res.json({
      success: true,
      post: data,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "خطای سرور",
    });
  }
});
app.get("/api/posts", auth, async (req, res) => {
try {
const { data: posts, error } = await supabase
  .from("posts")
  .select("*")
  .order("created_at", {
    ascending: false,
  });


if (error) {
  return res.status(500).json(error);
}

const result = await Promise.all(
  posts.map(async (post) => {
    const { count: likesCount } = await supabase
      .from("likes")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("post_id", post.id);

    const { count: commentsCount } = await supabase
      .from("comments")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("post_id", post.id);

    const { data: author } = await supabase
      .from("users")
      .select(
        "id, username, display_name, avatar_url, is_verified, role"
      )
      .eq("id", post.user_id)
      .single();

    const { data: likeRow } = await supabase
      .from("likes")
      .select("id")
      .eq("post_id", post.id)
      .eq("user_id", req.user.id)
      .maybeSingle();

return {
  ...post,
  author,
  likes_count:
    author?.role === "admin"
      ? (likesCount || 0) + 100
      : likesCount || 0,
  comments_count: commentsCount || 0,
  is_liked: !!likeRow,
};
  })
);

res.json(result);


} catch (err) {
console.error(err);


res.status(500).json({
  error: "خطای سرور",
});


}
});

app.post("/api/posts/:id/like", auth, async (req, res) => {
  try {
    const postId = req.params.id;

    const { data: existingLikes } = await supabase
      .from("likes")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", req.user.id);

    // حذف لایک
    if (existingLikes && existingLikes.length > 0) {
      await supabase
        .from("likes")
        .delete()
        .eq("id", existingLikes[0].id);

      return res.json({
        success: true,
        liked: false,
      });
    }

    // ساخت لایک
    await supabase.from("likes").insert({
      post_id: postId,
      user_id: req.user.id,
    });

    // گرفتن صاحب پست
    const { data: post } = await supabase
      .from("posts")
      .select("user_id")
      .eq("id", postId)
      .single();

    // ساخت نوتیف لایک
    if (post && post.user_id !== req.user.id) {
      await supabase
        .from("notifications")
        .insert({
          user_id: post.user_id,
          sender_id: req.user.id,
          type: "like",
          post_id: postId,
        });
    }

    return res.json({
      success: true,
      liked: true,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Server Error",
    });
  }
});

app.post("/api/comments/create", auth, async (req, res) => {
  const { post_id, content } = req.body;

  if (!content) {
    return res.status(400).json({
      error: "متن کامنت خالی است",
    });
  }

  const { data, error } = await supabase
    .from("comments")
    .insert([
      {
        post_id,
        user_id: req.user.id,
        content,
      },
    ])
    .select();

  if (error) {
    return res.status(500).json(error);
  }

  const { data: post } = await supabase
    .from("posts")
    .select("user_id")
    .eq("id", post_id)
    .single();

  if (post && post.user_id !== req.user.id) {
    await supabase.from("notifications").insert({
      user_id: post.user_id,
      sender_id: req.user.id,
      type: "comment",
      post_id,
    });
  }

  res.json({
    success: true,
    comment: data[0],
  });
});
app.get("/api/comments/:postId", async (req, res) => {
  const { data: comments, error } = await supabase
    .from("comments")
    .select("*")
    .eq("post_id", req.params.postId)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    return res.status(500).json(error);
  }

  const commentsWithUsers = await Promise.all(
    comments.map(async (comment) => {
      const { data: user } = await supabase
        .from("users")
        .select(
          "username, display_name, avatar_url"
        )
        .eq("id", comment.user_id)
        .single();

      return {
        ...comment,
        author: user,
      };
    })
  );

  res.json(commentsWithUsers);
});
// فالو کردن کاربر
app.post("/api/users/:id/follow", auth, async (req, res) => {
  try {
    const followingId = req.params.id;

    if (Number(followingId) === req.user.id) {
      return res.status(400).json({
        error: "نمی‌توانید خودتان را فالو کنید",
      });
    }

    const { data: existing } = await supabase
      .from("followers")
      .select("*")
      .eq("follower_id", req.user.id)
      .eq("following_id", followingId)
      .single();

    if (existing) {
      return res.status(400).json({
        error: "قبلاً فالو کرده‌اید",
      });
    }

    await supabase.from("followers").insert([
      {
        follower_id: req.user.id,
        following_id: followingId,
      },
    ]);
    await supabase.from("notifications").insert({
      user_id: followingId,
      sender_id: req.user.id,
      type: "follow",
    });

    res.json({
      success: true,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "خطای سرور",
    });
  }
});
app.get("/api/users/:username/followers", async (req, res) => {
  try {
    const username = decodeURIComponent(req.params.username);

    const { data: usersFound, error: userError } = await supabase
      .from("users")
      .select("id, role")
      .ilike("username", username)
      .limit(1);

    if (userError) return res.status(500).json(userError);

    const user = usersFound?.[0];
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.role === "admin" || user.role === "founder") {
      return res.status(403).json({ error: "Admin follow list is private" });
    }

    const { data: follows, error: followsError } = await supabase
      .from("followers")
      .select("follower_id")
      .eq("following_id", user.id);

    if (followsError) return res.status(500).json(followsError);

    const ids = [...new Set((follows || []).map((x) => x.follower_id).filter(Boolean))];

    if (ids.length === 0) return res.json([]);

    const result = [];

    for (const id of ids) {
      const { data: foundUser } = await supabase
        .from("users")
        .select("id, username, display_name, avatar_url, is_verified, role")
        .eq("id", id)
        .maybeSingle();

      if (foundUser) result.push(foundUser);
    }

    res.json(result);
  } catch (err) {
    console.error("followers error:", err);
    res.status(500).json({ error: String(err.message || err) });
  }
});

app.get("/api/users/:username/following", async (req, res) => {
  try {
    const username = decodeURIComponent(req.params.username);

    const { data: usersFound, error: userError } = await supabase
      .from("users")
      .select("id, role")
      .ilike("username", username)
      .limit(1);

    if (userError) return res.status(500).json(userError);

    const user = usersFound?.[0];
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.role === "admin" || user.role === "founder") {
      return res.status(403).json({ error: "Admin follow list is private" });
    }

    const { data: follows, error: followsError } = await supabase
      .from("followers")
      .select("following_id")
      .eq("follower_id", user.id);

    if (followsError) return res.status(500).json(followsError);

    const ids = [...new Set((follows || []).map((x) => x.following_id).filter(Boolean))];

    if (ids.length === 0) return res.json([]);

    const result = [];

    for (const id of ids) {
      const { data: foundUser } = await supabase
        .from("users")
        .select("id, username, display_name, avatar_url, is_verified, role")
        .eq("id", id)
        .maybeSingle();

      if (foundUser) result.push(foundUser);
    }

    res.json(result);
  } catch (err) {
    console.error("following error:", err);
    res.status(500).json({ error: String(err.message || err) });
  }
});

// دریافت پروفایل
app.get("/api/users/:username", async (req, res) => {
  try {
    const { data: user } = await supabase
      .from("users")
      .select("*")
      .ilike("username", req.params.username)
      .single();

    if (!user) {
      return res.status(404).json({
        error: "کاربر پیدا نشد",
      });
    }

    const { count: followersCount } = await supabase
      .from("followers")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("following_id", user.id);

    const { count: followingCount } = await supabase
      .from("followers")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("follower_id", user.id);
res.json({
  ...user,
  followers_count:
  user.role === "admin"
    ? (followersCount || 0) + 300
    : followersCount || 0,

  following_count: followingCount || 0,
});
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "خطای سرور",
    });
  }
});

app.get("/api/users/:username/posts", async (req, res) => {
  try {
    const { data: user } = await supabase
      .from("users")
      .select("id")
      .ilike("username", req.params.username)
      .single();

    if (!user) {
      return res.status(404).json({
        error: "کاربر پیدا نشد",
      });
    }

    const { data: posts } = await supabase
      .from("posts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false,
      });

    const result = [];
    for (const post of posts) {
      const { data: author } = await supabase
        .from("users")
        .select(
          `
        id,
        username,
        display_name,
        avatar_url,
        is_verified,
        role
        
      `,
        )
        .eq("id", post.user_id)
        .single();
        const { count: likesCount } = await supabase
  .from("likes")
  .select("*", {
    count: "exact",
    head: true,
  })
  .eq("post_id", post.id);

const { count: commentsCount } = await supabase
  .from("comments")
  .select("*", {
    count: "exact",
    head: true,
  })
  .eq("post_id", post.id);
result.push({
  ...post,
  author,

  likes_count:
    author?.role === "admin"
      ? (likesCount || 0) + 100
      : likesCount || 0,

  comments_count:
    commentsCount || 0,
});
    }

    res.json(result);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "خطای سرور",
    });
  }
});
// آنفالو
app.delete("/api/users/:id/follow", auth, async (req, res) => {
  try {
    await supabase
      .from("followers")
      .delete()
      .eq("follower_id", req.user.id)
      .eq("following_id", req.params.id);

    res.json({
      success: true,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "خطای سرور",
    });
  }
});
app.get("/api/users/:id/is-following", auth, async (req, res) => {
  try {
    const { data } = await supabase
      .from("followers")
      .select("*")
      .eq("follower_id", req.user.id)
      .eq("following_id", req.params.id)
      .single();

    res.json({
      following: !!data,
    });
  } catch {
    res.json({
      following: false,
    });
  }
});
app.put("/api/users/me", auth, async (req, res) => {
  try {
    const { display_name, bio, avatar_url } = req.body;

    const { data, error } = await supabase
      .from("users")
      .update({
        display_name,
        bio,
        avatar_url,
      })
      .eq("id", req.user.id)
      .select()
      .single();

    if (error) {
      return res.status(500).json(error);
    }

    res.json({
      success: true,
      user: data,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "خطای سرور",
    });
  }
});
app.get("/api/search/users", async (req, res) => {
  try {
    const q = req.query.q || "";

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .ilike("username", `%${q}%`)
      .limit(20);

    if (error) {
      return res.status(500).json(error);
    }

    res.json(data);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "خطای سرور",
    });
  }
});
app.post("/api/messages/start", auth, async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        error: "userId required",
      });
    }

    const { data: myConversations } = await supabase
      .from("conversation_members")
      .select("*")
      .eq("user_id", req.user.id);

    for (const item of myConversations || []) {
      const { data: members } = await supabase
        .from("conversation_members")
        .select("*")
        .eq("conversation_id", item.conversation_id);

      const exists = members?.find((m) => m.user_id === userId);

      if (exists) {
        return res.json({
          conversation_id: item.conversation_id,
        });
      }
    }

    const { data: conversation } = await supabase
      .from("conversations")
      .insert({})
      .select()
      .single();

    await supabase.from("conversation_members").insert([
      {
        conversation_id: conversation.id,
        user_id: req.user.id,
      },
      {
        conversation_id: conversation.id,
        user_id: userId,
      },
    ]);

    res.json({
      conversation_id: conversation.id,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Server Error",
    });
  }
});
app.post("/api/messages/send", auth, async (req, res) => {
  try {
    const { conversation_id, content } = req.body;

    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversation_id,
        sender_id: req.user.id,
        content,
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json(error);
    }

    res.json(data);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Server Error",
    });
  }
});
app.get("/api/messages/:conversationId", auth, async (req, res) => {
  try {
    const { conversationId } = req.params;

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", {
        ascending: true,
      });

    if (error) {
      return res.status(500).json(error);
    }

    res.json(data);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Server Error",
    });
  }
});

app.get("/api/conversations", auth, async (req, res) => {
  try {
    const { data: memberships } = await supabase
      .from("conversation_members")
      .select("*")
      .eq("user_id", req.user.id);

    const result = [];

    for (const m of memberships || []) {
      const { data: members } = await supabase
        .from("conversation_members")
        .select("*")
        .eq("conversation_id", m.conversation_id);

      const other = members.find((x) => x.user_id !== req.user.id);

      if (!other) continue;

      const { data: user } = await supabase
        .from("users")
        .select(
          "id, username, display_name, avatar_url, is_online, last_seen, is_verified",
        )
        .eq("id", other.user_id)
        .single();

      result.push({
        conversation_id: m.conversation_id,
        user,
      });
    }

    res.json(result);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Server Error",
    });
  }
});
app.get("/api/notifications", auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select(
        `
      *,
      sender:users!notifications_sender_id_fkey(
        id,
        username,
        display_name,
        avatar_url
      )
    `,
      )
      .eq("user_id", req.user.id)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      return res.status(500).json(error);
    }

    res.json(data);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Server Error",
    });
  }
});
app.put("/api/users/online", auth, async (req, res) => {
  await supabase
    .from("users")
    .update({
      is_online: true,
    })
    .eq("id", req.user.id);

  res.json({
    success: true,
  });
});
app.put("/api/users/offline", auth, async (req, res) => {
  await supabase
    .from("users")
    .update({
      is_online: false,
      last_seen: new Date(),
    })
    .eq("id", req.user.id);

  res.json({
    success: true,
  });
});
app.delete("/api/posts/:id", auth, async (req, res) => {
  try {
    const postId = req.params.id;

    const { data: post } = await supabase
      .from("posts")
      .select("*")
      .eq("id", postId)
      .single();

    if (!post) {
      return res.status(404).json({
        error: "پست پیدا نشد",
      });
    }

    if (post.user_id !== req.user.id) {
      return res.status(403).json({
        error: "اجازه حذف ندارید",
      });
    }

    await supabase.from("likes").delete().eq("post_id", postId);

    await supabase.from("comments").delete().eq("post_id", postId);

    await supabase.from("notifications").delete().eq("post_id", postId);

    await supabase.from("posts").delete().eq("id", postId);

    res.json({
      success: true,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "خطای سرور",
    });
  }
});
app.get("/api/admin/users", auth, admin, async (req, res) => {
  const { data, error } = await supabase.from("users").select("*").order("id");

  if (error) {
    return res.status(500).json(error);
  }

  res.json(data);
});
app.get("/api/admin/users", auth, admin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("id", {
        ascending: true,
      });

    if (error) {
      return res.status(500).json(error);
    }

    res.json(data);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Server Error",
    });
  }
});
app.put("/api/admin/verify/:id", auth, admin, async (req, res) => {
  try {
    const { error } = await supabase
      .from("users")
      .update({
        is_verified: true,
      })
      .eq("id", req.params.id);

    if (error) {
      return res.status(500).json(error);
    }

    res.json({
      success: true,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Server Error",
    });
  }
});
app.put("/api/admin/unverify/:id", auth, admin, async (req, res) => {
  try {
    const { error } = await supabase
      .from("users")
      .update({
        is_verified: false,
      })
      .eq("id", req.params.id);

    if (error) {
      return res.status(500).json(error);
    }

    res.json({
      success: true,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Server Error",
    });
  }
});
// دادن ادمین

app.put("/api/admin/make-admin/:id", auth, admin, async (req, res) => {
  try {
    await supabase
      .from("users")
      .update({
        role: "admin",
      })
      .eq("id", req.params.id);

    res.json({
      success: true,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Server Error",
    });
  }
});

// حذف ادمین

app.put("/api/admin/remove-admin/:id", auth, admin, async (req, res) => {
  try {
    await supabase
      .from("users")
      .update({
        role: "user",
      })
      .eq("id", req.params.id);

    res.json({
      success: true,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Server Error",
    });
  }
});

// حذف کاربر

app.delete("/api/admin/user/:id", auth, admin, async (req, res) => {
  try {
    await supabase
      .from("followers")
      .delete()
      .or(`follower_id.eq.${req.params.id},following_id.eq.${req.params.id}`);

    await supabase.from("likes").delete().eq("user_id", req.params.id);

    await supabase.from("comments").delete().eq("user_id", req.params.id);

    await supabase.from("posts").delete().eq("user_id", req.params.id);

    await supabase.from("users").delete().eq("id", req.params.id);

    res.json({
      success: true,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Server Error",
    });
  }
});
app.get("/api/admin/stats", auth, admin, async (req, res) => {
  try {
    const { count: users } = await supabase.from("users").select("*", {
      count: "exact",
      head: true,
    });

    const { count: posts } = await supabase.from("posts").select("*", {
      count: "exact",
      head: true,
    });

    const { count: comments } = await supabase.from("comments").select("*", {
      count: "exact",
      head: true,
    });

    const { count: likes } = await supabase.from("likes").select("*", {
      count: "exact",
      head: true,
    });

    res.json({
      users,
      posts,
      comments,
      likes,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Server Error",
    });
  }
});
app.put("/api/admin/ban/:id", auth, admin, async (req, res) => {
  try {
    const { data: targetUser, error: userError } =
      await supabase
        .from("users")
        .select("id, role")
        .eq("id", req.params.id)
        .single();

    if (userError) {
      return res.status(500).json(userError);
    }

    // هیچکس نمی‌تواند Founder را بن کند
    if (targetUser.role === "founder") {
      return res.status(403).json({
        error: "Founder account is protected",
      });
    }

    // فقط Founder می‌تواند Admin را بن کند
    if (
      targetUser.role === "admin" &&
      req.user.role !== "founder"
    ) {
      return res.status(403).json({
        error: "Only founder can ban admins",
      });
    }

    const { error } = await supabase
      .from("users")
      .update({
        banned: true,
      })
      .eq("id", req.params.id);

    if (error) {
      return res.status(500).json(error);
    }

    res.json({
      success: true,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Server Error",
    });
  }
});
app.put("/api/admin/unban/:id", auth, admin, async (req, res) => {
  try {
    const { error } = await supabase
      .from("users")
      .update({
        banned: false,
      })
      .eq("id", req.params.id);

    if (error) {
      return res.status(500).json(error);
    }

    res.json({
      success: true,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Server Error",
    });
  }
});
app.get("/api/admin/posts", auth, admin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("posts")
      .select(
        `
            *,
            author:users(
              username,
              display_name
            )
          `,
      )
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      return res.status(500).json(error);
    }

    res.json(data);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Server Error",
    });
  }
});
app.delete("/api/admin/post/:id", auth, admin, async (req, res) => {
  try {
    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", req.params.id);

    if (error) {
      return res.status(500).json(error);
    }

    res.json({
      success: true,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Server Error",
    });
  }
});
app.delete("/api/admin/comment/:id", auth, admin, async (req, res) => {
  try {
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", req.params.id);

    if (error) {
      return res.status(500).json(error);
    }

    res.json({
      success: true,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Server Error",
    });
  }
});
app.get("/api/admin/comments", auth, admin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      return res.status(500).json(error);
    }

    res.json(data);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Server Error",
    });
  }
});
app.post("/api/reports", auth, async (req, res) => {
  try {
    console.log(req.body);
    console.log(req.user);

    const { target_user_id, post_id, reason } = req.body;

    const { data, error } = await supabase
      .from("reports")
      .insert({
        reporter_id: req.user.id,
        target_user_id,
        post_id,
        reason,
      })
      .select();

    console.log(error);
    console.log(data);

    if (error) {
      return res.status(500).json(error);
    }

    res.json({
      success: true,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Server Error",
    });
  }
});
app.get("/api/admin/reports", auth, admin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      return res.status(500).json(error);
    }

    res.json(data);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Server Error",
    });
  }
});
app.delete("/api/admin/report/:id", auth, admin, async (req, res) => {
  try {
    const { error } = await supabase
      .from("reports")
      .delete()
      .eq("id", req.params.id);

    if (error) {
      return res.status(500).json(error);
    }

    res.json({
      success: true,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Server Error",
    });
  }
});
app.get("/api/posts/:id", async (req, res) => {
  const { data, error } = await supabase
    .from("posts")
    .select(`
      *,
      author:users (
        id,
        username,
        display_name,
        avatar_url,
        role,
        is_verified
      )
    `)
    .eq("id", req.params.id)
    .single();

  if (error) {
    return res.status(404).json(error);
  }

  res.json(data);
});
app.delete("/api/comments/:id", auth, async (req, res) => {
  try {
    const commentId = req.params.id;

    const { data: comment } = await supabase
      .from("comments")
      .select("*")
      .eq("id", commentId)
      .single();

    if (!comment) {
      return res.status(404).json({
        error: "کامنت پیدا نشد",
      });
    }

    const { data: post } = await supabase
      .from("posts")
      .select("user_id")
      .eq("id", comment.post_id)
      .single();

    const isCommentOwner = String(comment.user_id) === String(req.user.id);
    const isPostOwner = String(post?.user_id) === String(req.user.id);

    if (!isCommentOwner && !isPostOwner) {
      return res.status(403).json({
        error: "اجازه حذف کامنت را ندارید",
      });
    }

    await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    res.json({
      success: true,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Server Error",
    });
  }
});
app.delete("/api/messages/:id", auth, async (req, res) => {
  try {
    const messageId = req.params.id;

    const { data: message } = await supabase
      .from("messages")
      .select("*")
      .eq("id", messageId)
      .single();

    if (!message) {
      return res.status(404).json({
        error: "پیام پیدا نشد",
      });
    }

    if (String(message.sender_id) !== String(req.user.id)) {
      return res.status(403).json({
        error: "اجازه حذف پیام را ندارید",
      });
    }

    const { error } = await supabase
      .from("messages")
      .delete()
      .eq("id", messageId);

    if (error) {
      return res.status(500).json(error);
    }

    res.json({
      success: true,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Server Error",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Castle X running on port ${PORT}`);
});
