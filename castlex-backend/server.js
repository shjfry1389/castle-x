const multer = require("multer");
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
});
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
    let { username, display_name, password } = req.body;

    username = username?.trim();
    display_name = display_name?.trim();

    if (!username || !display_name || !password) {
      return res.status(400).json({
        error: "همه فیلدها الزامی هستند",
      });
    }

    if (username.length < 3) {
      return res.status(400).json({
        error: "نام کاربری باید حداقل ۳ کاراکتر باشد",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "رمز عبور باید حداقل ۶ کاراکتر باشد",
      });
    }

    const { data: existingUser, error: existingError } = await supabase
      .from("users")
      .select("id, username")
      .ilike("username", username)
      .maybeSingle();

    if (existingError) {
      console.error("REGISTER CHECK USER ERROR:", existingError);
      return res.status(500).json({
        error: "خطا در بررسی نام کاربری",
        details: existingError.message,
      });
    }

    if (existingUser) {
      return res.status(409).json({
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
      .select("id, username, display_name, avatar_url, is_verified, role, premium_until, premium_plan")
      .single();

    if (error) {
      console.error("REGISTER INSERT ERROR:", error);

      if (error.code === "23505") {
        return res.status(409).json({
          error: "این نام کاربری قبلا ثبت شده است",
        });
      }

      return res.status(500).json({
        error: "خطا در ثبت نام",
        details: error.message,
        code: error.code,
      });
    }

    return res.json({
      success: true,
      user: data,
    });
  } catch (err) {
    console.error("REGISTER SERVER ERROR:", err);

    return res.status(500).json({
      error: "خطای سرور هنگام ثبت نام",
      details: err.message,
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
    const limit = Math.min(Number(req.query.limit) || 15, 30);
const page = Math.max(Number(req.query.page) || 1, 1);
const from = (page - 1) * limit;
const to = from + limit - 1;
    const { data: posts, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) return res.status(500).json(error);

    const now = new Date();

    const result = await Promise.all(
      posts.map(async (post) => {
        const { count: likesCount } = await supabase
          .from("likes")
          .select("*", { count: "exact", head: true })
          .eq("post_id", post.id);

        const { count: commentsCount } = await supabase
          .from("comments")
          .select("*", { count: "exact", head: true })
          .eq("post_id", post.id);

        const { data: author } = await supabase
          .from("users")
          .select("id, username, display_name, avatar_url, is_verified, role, premium_until, premium_plan")
          .eq("id", post.user_id)
          .single();

        const { data: likeRow } = await supabase
          .from("likes")
          .select("id")
          .eq("post_id", post.id)
          .eq("user_id", req.user.id)
          .maybeSingle();

        const { data: promotion } = await supabase
          .from("post_promotions")
          .select("*")
          .eq("post_id", post.id)
          .eq("active", true)
          .lte("starts_at", now.toISOString())
          .gt("ends_at", now.toISOString())
          .order("priority", { ascending: false })
          .limit(1)
          .maybeSingle();

        let feedTime = post.created_at;

        if (promotion) {
          const lastBumpedAt = new Date(promotion.last_bumped_at || promotion.created_at);
          const intervalMs = (promotion.bump_interval_minutes || 60) * 60 * 1000;

          if (now.getTime() - lastBumpedAt.getTime() >= intervalMs) {
            const bumpedAt = now.toISOString();

            await supabase
              .from("post_promotions")
              .update({ last_bumped_at: bumpedAt })
              .eq("id", promotion.id);

            feedTime = bumpedAt;
          } else {
            feedTime = promotion.last_bumped_at || promotion.created_at;
          }
        }

        return {
          ...post,
          author,
          likes_count:
            author?.role === "admin"
              ? (likesCount || 0) + 100
              : likesCount || 0,
          comments_count: commentsCount || 0,
          views_count:
            author?.role === "admin"
              ? (post.views_count || 0) + 200
              : post.views_count || 0,
          is_liked: !!likeRow,
          is_hot: !!promotion,
          hot_priority: promotion?.priority || 0,
          hot_until: promotion?.ends_at || null,
          feed_time: feedTime,
        };
      })
    );

    result.sort((a, b) => {
      const hotDiff = (b.hot_priority || 0) - (a.hot_priority || 0);
      if (hotDiff !== 0) return hotDiff;

      return new Date(b.feed_time).getTime() - new Date(a.feed_time).getTime();
    });

    res.json(result);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "خطای سرور",
    });
  }
});
app.get("/api/posts/following", auth, async (req, res) => {
  try {
    const { data: follows, error: followsError } = await supabase
      .from("followers")
      .select("following_id")
      .eq("follower_id", req.user.id);

    if (followsError) {
      return res.status(500).json({
        error: "خطا در گرفتن لیست فالویینگ",
        details: followsError.message,
      });
    }

    const followingIds = [
      ...new Set((follows || []).map((item) => item.following_id).filter(Boolean)),
    ];

    if (followingIds.length === 0) {
      return res.json([]);
    }

    const { data: posts, error } = await supabase
      .from("posts")
      .select("*")
      .in("user_id", followingIds)
      .order("created_at", { ascending: false });

    if (error) return res.status(500).json(error);

    const now = new Date();

    const result = await Promise.all(
      posts.map(async (post) => {
        const { count: likesCount } = await supabase
          .from("likes")
          .select("*", { count: "exact", head: true })
          .eq("post_id", post.id);

        const { count: commentsCount } = await supabase
          .from("comments")
          .select("*", { count: "exact", head: true })
          .eq("post_id", post.id);

        const { data: author } = await supabase
          .from("users")
          .select("id, username, display_name, avatar_url, is_verified, role, premium_until, premium_plan")
          .eq("id", post.user_id)
          .single();

        const { data: likeRow } = await supabase
          .from("likes")
          .select("id")
          .eq("post_id", post.id)
          .eq("user_id", req.user.id)
          .maybeSingle();

        const { data: promotion } = await supabase
          .from("post_promotions")
          .select("*")
          .eq("post_id", post.id)
          .eq("active", true)
          .lte("starts_at", now.toISOString())
          .gt("ends_at", now.toISOString())
          .order("priority", { ascending: false })
          .limit(1)
          .maybeSingle();

        return {
          ...post,
          author,
          likes_count:
            author?.role === "admin"
              ? (likesCount || 0) + 100
              : likesCount || 0,
          comments_count: commentsCount || 0,
          views_count:
            author?.role === "admin"
              ? (post.views_count || 0) + 200
              : post.views_count || 0,
          is_liked: !!likeRow,
          is_hot: !!promotion,
          hot_priority: promotion?.priority || 0,
          hot_until: promotion?.ends_at || null,
          feed_time: promotion?.last_bumped_at || post.created_at,
        };
      })
    );

    result.sort((a, b) => {
      const hotDiff = (b.hot_priority || 0) - (a.hot_priority || 0);
      if (hotDiff !== 0) return hotDiff;

      return new Date(b.feed_time).getTime() - new Date(a.feed_time).getTime();
    });

    res.json(result);
  } catch (err) {
    console.error("FOLLOWING POSTS ERROR:", err);

    res.status(500).json({
      error: "خطای سرور",
      details: err.message,
    });
  }
});
app.post("/api/posts/:id/view", async (req, res) => {
  try {
    const { id } = req.params;
    const { visitor_key } = req.body || {};

    let viewerKey = null;

    const authHeader = req.headers.authorization || "";

    if (authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded?.id) {
          viewerKey = `user:${decoded.id}`;
        }
      } catch (err) {
        viewerKey = null;
      }
    }

    if (!viewerKey) {
      const safeVisitorKey =
        visitor_key ||
        `${req.ip || "unknown"}-${req.headers["user-agent"] || "unknown"}`;

      viewerKey = `visitor:${safeVisitorKey}`;
    }

    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("id, views_count")
      .eq("id", id)
      .maybeSingle();

    if (postError) {
      return res.status(500).json({
        error: "خطا در بررسی پست",
        details: postError.message,
      });
    }

    if (!post) {
      return res.status(404).json({
        error: "پست پیدا نشد",
      });
    }

    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();

    const { data: existingView, error: existingError } = await supabase
      .from("post_views")
      .select("id")
      .eq("post_id", id)
      .eq("viewer_key", viewerKey)
      .gte("created_at", sixHoursAgo)
      .maybeSingle();

    if (existingError) {
      return res.status(500).json({
        error: "خطا در بررسی بازدید",
        details: existingError.message,
      });
    }

    if (existingView) {
      return res.json({
        success: true,
        counted: false,
        views_count: post.views_count || 0,
      });
    }

    const { error: insertError } = await supabase.from("post_views").insert({
      post_id: id,
      viewer_key: viewerKey,
    });

    if (insertError) {
      return res.status(500).json({
        error: "خطا در ثبت بازدید",
        details: insertError.message,
      });
    }

    const { data: newViewsCount, error: incrementError } = await supabase.rpc(
      "increment_post_views",
      {
        post_id_input: Number(id),
      }
    );

    if (incrementError) {
      return res.status(500).json({
        error: "خطا در افزایش بازدید",
        details: incrementError.message,
      });
    }

    res.json({
      success: true,
      counted: true,
      views_count: newViewsCount || 0,
    });
  } catch (err) {
    console.error("POST VIEW ERROR:", err);

    res.status(500).json({
      error: "خطای سرور در ثبت ویو",
      details: err.message,
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
          "username, display_name, avatar_url, role, is_verified, premium_until, premium_plan"
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

    if (userError) {
      console.error("followers userError:", userError);
      return res.status(500).json(userError);
    }

    const profileUser = usersFound?.[0];

    if (!profileUser) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    if (profileUser.role === "admin" || profileUser.role === "founder") {
      return res.status(403).json({
        error: "Admin follow list is private",
      });
    }

    const { data: follows, error: followsError } = await supabase
      .from("followers")
      .select("follower_id")
      .eq("following_id", profileUser.id);

    if (followsError) {
      console.error("followers followsError:", followsError);
      return res.status(500).json(followsError);
    }

    const ids = [
      ...new Set(
        (follows || [])
          .map((item) => item.follower_id)
          .filter(Boolean)
      ),
    ];

    if (ids.length === 0) {
      return res.json([]);
    }

    const result = [];

    for (const id of ids) {
      const { data: foundUser, error: foundUserError } = await supabase
        .from("users")
        .select("id, username, display_name, avatar_url, is_verified, role, premium_until, premium_plan")
        .eq("id", id)
        .maybeSingle();

      if (foundUserError) {
        console.error("followers foundUserError:", foundUserError);
      }

      if (foundUser) {
        result.push(foundUser);
      }
    }

    return res.json(result);
  } catch (err) {
    console.error("followers error:", err);

    return res.status(500).json({
      error: String(err.message || err),
    });
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

    if (userError) {
      console.error("following userError:", userError);
      return res.status(500).json(userError);
    }

    const profileUser = usersFound?.[0];

    if (!profileUser) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    if (profileUser.role === "admin" || profileUser.role === "founder") {
      return res.status(403).json({
        error: "Admin follow list is private",
      });
    }

    const { data: follows, error: followsError } = await supabase
      .from("followers")
      .select("following_id")
      .eq("follower_id", profileUser.id);

    if (followsError) {
      console.error("following followsError:", followsError);
      return res.status(500).json(followsError);
    }

    const ids = [
      ...new Set(
        (follows || [])
          .map((item) => item.following_id)
          .filter(Boolean)
      ),
    ];

    if (ids.length === 0) {
      return res.json([]);
    }

    const result = [];

    for (const id of ids) {
      const { data: foundUser, error: foundUserError } = await supabase
        .from("users")
        .select("id, username, display_name, avatar_url, is_verified, role, premium_until, premium_plan")
        .eq("id", id)
        .maybeSingle();

      if (foundUserError) {
        console.error("following foundUserError:", foundUserError);
      }

      if (foundUser) {
        result.push(foundUser);
      }
    }

    return res.json(result);
  } catch (err) {
    console.error("following error:", err);

    return res.status(500).json({
      error: String(err.message || err),
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
        role,
      premium_until,
      premium_plan
        
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

  comments_count: commentsCount || 0,

  views_count:
    author?.role === "admin"
      ? (post.views_count || 0) + 200
      : post.views_count || 0,
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
    const { conversation_id, content, reply_to_id } = req.body;

    const text = content?.trim() || "";

    if (!conversation_id || !text) {
      return res.status(400).json({
        error: "conversation_id و content الزامی هستند",
      });
    }

    let replyToContent = null;

    if (reply_to_id) {
      const { data: replyMessage, error: replyError } = await supabase
        .from("messages")
        .select("content")
        .eq("id", reply_to_id)
        .eq("conversation_id", conversation_id)
        .maybeSingle();

      if (replyError) {
        return res.status(500).json({
          error: "خطا در بررسی پیام ریپلای شده",
          details: replyError.message,
        });
      }

      if (replyMessage) {
        replyToContent = replyMessage.content;
      }
    }

    const insertData = {
      conversation_id,
      sender_id: req.user.id,
      content: text,
      reply_to_id: reply_to_id || null,
      reply_to_content: replyToContent,
    };

    const { data, error } = await supabase
      .from("messages")
      .insert(insertData)
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
app.put("/api/messages/:conversationId/seen", auth, async (req, res) => {
  try {
    const { conversationId } = req.params;

    const { error } = await supabase
      .from("messages")
      .update({
        seen_at: new Date().toISOString(),
      })
      .eq("conversation_id", conversationId)
      .neq("sender_id", req.user.id)
      .is("seen_at", null);

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
  "id, username, display_name, avatar_url, is_online, last_seen, is_verified, role, premium_until, premium_plan",
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
app.put("/api/admin/users/:id/account", auth, admin, async (req, res) => {
  try {
    const { id } = req.params;
    let { username, display_name, password, admin_edit_secret } = req.body;

    if (admin_edit_secret !== process.env.ADMIN_EDIT_SECRET) {
      return res.status(403).json({
        error: "رمز ویرایش ادمین اشتباه است",
      });
    }

    username = username?.trim();
    display_name = display_name?.trim();

    if (!username || !display_name) {
      return res.status(400).json({
        error: "نام کاربری و نام نمایشی الزامی هستند",
      });
    }

    if (password && password.length < 6) {
      return res.status(400).json({
        error: "رمز جدید باید حداقل ۶ کاراکتر باشد",
      });
    }

    const { data: targetUser, error: targetError } = await supabase
      .from("users")
      .select("id, role")
      .eq("id", id)
      .maybeSingle();

    if (targetError) {
      return res.status(500).json({
        error: "خطا در بررسی کاربر",
        details: targetError.message,
      });
    }

    if (!targetUser) {
      return res.status(404).json({
        error: "کاربر پیدا نشد",
      });
    }

    const { data: sameUsername, error: sameUsernameError } = await supabase
      .from("users")
      .select("id")
      .ilike("username", username)
      .neq("id", id)
      .maybeSingle();

    if (sameUsernameError) {
      return res.status(500).json({
        error: "خطا در بررسی نام کاربری",
        details: sameUsernameError.message,
      });
    }

    if (sameUsername) {
      return res.status(409).json({
        error: "این نام کاربری قبلا استفاده شده است",
      });
    }

    const updateData = {
      username,
      display_name,
    };

    if (password && password.trim()) {
      updateData.password_hash = await bcrypt.hash(password.trim(), 10);
    }

    const { data, error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", id)
      .select("id, username, display_name, avatar_url, is_verified, role, banned, premium_until, premium_plan")
      .single();

    if (error) {
      return res.status(500).json({
        error: "خطا در تغییر اطلاعات کاربر",
        details: error.message,
      });
    }

    res.json({
      success: true,
      user: data,
    });
  } catch (err) {
    console.error("ADMIN UPDATE USER ACCOUNT ERROR:", err);

    res.status(500).json({
      error: "خطای سرور",
      details: err.message,
    });
  }
});
// حذف کاربر

app.post("/api/admin/users/:id/delete-secure", auth, admin, async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_edit_secret } = req.body || {};

    if (!process.env.ADMIN_EDIT_SECRET) {
      return res.status(500).json({
        error: "ADMIN_EDIT_SECRET روی سرور تنظیم نشده است",
      });
    }

    if (!admin_edit_secret || admin_edit_secret.trim() !== process.env.ADMIN_EDIT_SECRET) {
      return res.status(403).json({
        error: "رمز محرمانه ادمین اشتباه است",
      });
    }

    await supabase
      .from("followers")
      .delete()
      .or(`follower_id.eq.${id},following_id.eq.${id}`);

    await supabase.from("likes").delete().eq("user_id", id);
    await supabase.from("comments").delete().eq("user_id", id);
    await supabase.from("posts").delete().eq("user_id", id);
    await supabase.from("users").delete().eq("id", id);

    res.json({ success: true });
  } catch (err) {
    console.error("ADMIN SECURE DELETE USER ERROR:", err);

    res.status(500).json({
      error: "خطا در حذف کاربر",
      details: err.message,
    });
  }
});
app.post("/api/admin/posts/:id/hot", auth, admin, async (req, res) => {
  try {
    const { id } = req.params;

    let {
      duration_hours,
      priority,
      bump_interval_minutes,
    } = req.body || {};

    duration_hours = Number(duration_hours) || 24;
    priority = Number(priority) || 1;
    bump_interval_minutes = Number(bump_interval_minutes) || 60;

    if (duration_hours < 1) duration_hours = 1;
    if (duration_hours > 720) duration_hours = 720;

    if (priority < 1) priority = 1;
    if (priority > 10) priority = 10;

    if (bump_interval_minutes < 10) bump_interval_minutes = 10;
    if (bump_interval_minutes > 1440) bump_interval_minutes = 1440;

    const endsAt = new Date(
      Date.now() + duration_hours * 60 * 60 * 1000
    ).toISOString();

    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (postError) {
      return res.status(500).json({
        error: "خطا در بررسی پست",
        details: postError.message,
      });
    }

    if (!post) {
      return res.status(404).json({
        error: "پست پیدا نشد",
      });
    }

    await supabase
      .from("post_promotions")
      .update({ active: false })
      .eq("post_id", id)
      .eq("active", true);

    const { data, error } = await supabase
      .from("post_promotions")
      .insert({
        post_id: id,
        active: true,
        priority,
        ends_at: endsAt,
        bump_interval_minutes,
        last_bumped_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        error: "خطا در داغ کردن پست",
        details: error.message,
      });
    }

    res.json({
      success: true,
      promotion: data,
    });
  } catch (err) {
    console.error("MAKE HOT POST ERROR:", err);

    res.status(500).json({
      error: "خطای سرور در داغ کردن پست",
      details: err.message,
    });
  }
});

app.post("/api/admin/posts/:id/stop-hot", auth, admin, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("post_promotions")
      .update({ active: false })
      .eq("post_id", id)
      .eq("active", true);

    if (error) {
      return res.status(500).json({
        error: "خطا در خاموش کردن پست داغ",
        details: error.message,
      });
    }

    res.json({
      success: true,
    });
  } catch (err) {
    console.error("STOP HOT POST ERROR:", err);

    res.status(500).json({
      error: "خطای سرور",
      details: err.message,
    });
  }
});
app.post("/api/posts/:id/hot-request", auth, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, premium_plan, premium_until")
      .eq("id", req.user.id)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: "کاربر پیدا نشد" });
    }

    const premiumActive =
      user.premium_plan === "silver" &&
      user.premium_until &&
      new Date(user.premium_until).getTime() > Date.now();

    if (!premiumActive) {
      return res.status(403).json({
        error: "فقط کاربران Premium می‌توانند درخواست پست داغ بدهند",
      });
    }

    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("id, user_id")
      .eq("id", id)
      .eq("user_id", req.user.id)
      .maybeSingle();

    if (postError || !post) {
      return res.status(404).json({
        error: "این پست برای شما نیست یا پیدا نشد",
      });
    }

    const { count } = await supabase
      .from("hot_post_requests")
      .select("*", { count: "exact", head: true })
      .eq("user_id", req.user.id)
      .in("status", ["pending", "approved"]);

    if ((count || 0) >= 3) {
      return res.status(403).json({
        error: "شما فقط می‌توانید برای ۳ پست درخواست داغ شدن بدهید",
      });
    }

    const { data, error } = await supabase
      .from("hot_post_requests")
      .insert({
        user_id: req.user.id,
        post_id: id,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        error: "خطا در ثبت درخواست",
        details: error.message,
      });
    }

    res.json({ success: true, request: data });
  } catch (err) {
    console.error("HOT REQUEST ERROR:", err);
    res.status(500).json({ error: "خطای سرور", details: err.message });
  }
});
app.get("/api/admin/hot-requests", auth, admin, async (req, res) => {
  try {
    const { data: requests, error } = await supabase
      .from("hot_post_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({
        error: "خطا در دریافت درخواست‌ها",
        details: error.message,
      });
    }

    const result = await Promise.all(
      (requests || []).map(async (request) => {
        const { data: user } = await supabase
          .from("users")
          .select(
            "id, username, display_name, avatar_url, role, is_verified, premium_until, premium_plan"
          )
          .eq("id", request.user_id)
          .maybeSingle();

        const { data: post } = await supabase
          .from("posts")
          .select("id, content, media_url, media_type, user_id, created_at")
          .eq("id", request.post_id)
          .maybeSingle();

        return {
          ...request,
          user,
          post,
        };
      })
    );

    res.json(result);
  } catch (err) {
    console.error("GET HOT REQUESTS ERROR:", err);
    res.status(500).json({
      error: "خطای سرور",
      details: err.message,
    });
  }
});

app.post("/api/admin/hot-requests/:id/approve", auth, admin, async (req, res) => {
  try {
    const { id } = req.params;

    let { duration_hours, priority, bump_interval_minutes, admin_note } =
      req.body || {};

    duration_hours = Number(duration_hours) || 24;
    priority = Number(priority) || 1;
    bump_interval_minutes = Number(bump_interval_minutes) || 60;

    if (duration_hours < 1) duration_hours = 1;
    if (duration_hours > 720) duration_hours = 720;

    if (priority < 1) priority = 1;
    if (priority > 10) priority = 10;

    if (bump_interval_minutes < 10) bump_interval_minutes = 10;
    if (bump_interval_minutes > 1440) bump_interval_minutes = 1440;

    const { data: request, error: requestError } = await supabase
      .from("hot_post_requests")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (requestError) {
      return res.status(500).json({
        error: "خطا در بررسی درخواست",
        details: requestError.message,
      });
    }

    if (!request) {
      return res.status(404).json({
        error: "درخواست پیدا نشد",
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        error: "این درخواست قبلاً بررسی شده است",
      });
    }

    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("id")
      .eq("id", request.post_id)
      .maybeSingle();

    if (postError || !post) {
      return res.status(404).json({
        error: "پست پیدا نشد",
      });
    }

    const endsAt = new Date(
      Date.now() + duration_hours * 60 * 60 * 1000
    ).toISOString();

    await supabase
      .from("post_promotions")
      .update({ active: false })
      .eq("post_id", request.post_id)
      .eq("active", true);

    const { data: promotion, error: promotionError } = await supabase
      .from("post_promotions")
      .insert({
        post_id: request.post_id,
        active: true,
        priority,
        ends_at: endsAt,
        bump_interval_minutes,
        last_bumped_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (promotionError) {
      return res.status(500).json({
        error: "خطا در داغ کردن پست",
        details: promotionError.message,
      });
    }

    const { data: updatedRequest, error: updateError } = await supabase
      .from("hot_post_requests")
      .update({
        status: "approved",
        admin_note: admin_note || null,
        decided_at: new Date().toISOString(),
        decided_by: req.user.id,
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      return res.status(500).json({
        error: "پست داغ شد ولی وضعیت درخواست آپدیت نشد",
        details: updateError.message,
      });
    }

    res.json({
      success: true,
      request: updatedRequest,
      promotion,
    });
  } catch (err) {
    console.error("APPROVE HOT REQUEST ERROR:", err);
    res.status(500).json({
      error: "خطای سرور",
      details: err.message,
    });
  }
});

app.post("/api/admin/hot-requests/:id/reject", auth, admin, async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_note } = req.body || {};

    const { data: request, error: requestError } = await supabase
      .from("hot_post_requests")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (requestError) {
      return res.status(500).json({
        error: "خطا در بررسی درخواست",
        details: requestError.message,
      });
    }

    if (!request) {
      return res.status(404).json({
        error: "درخواست پیدا نشد",
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        error: "این درخواست قبلاً بررسی شده است",
      });
    }

    const { data, error } = await supabase
      .from("hot_post_requests")
      .update({
        status: "rejected",
        admin_note: admin_note || null,
        decided_at: new Date().toISOString(),
        decided_by: req.user.id,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        error: "خطا در رد کردن درخواست",
        details: error.message,
      });
    }

    res.json({
      success: true,
      request: data,
    });
  } catch (err) {
    console.error("REJECT HOT REQUEST ERROR:", err);
    res.status(500).json({
      error: "خطای سرور",
      details: err.message,
    });
  }
});
app.put("/api/admin/users/:id/premium", auth, admin, async (req, res) => {
  try {
    const { id } = req.params;
    const { months } = req.body;

    const premiumMonths = Math.max(Number(months) || 1, 1);

    const premiumUntil = new Date();
    premiumUntil.setMonth(premiumUntil.getMonth() + premiumMonths);

    const { data, error } = await supabase
      .from("users")
      .update({
        premium_plan: "silver",
        premium_until: premiumUntil.toISOString(),
      })
      .eq("id", id)
      .select(
        "id, username, display_name, avatar_url, role, is_verified, banned, premium_until, premium_plan"
      )
      .single();

    if (error) {
      return res.status(500).json({
        error: "خطا در فعال کردن پریمیوم",
        details: error.message,
      });
    }

    res.json({
      success: true,
      user: data,
    });
  } catch (err) {
    console.error("SET PREMIUM ERROR:", err);

    res.status(500).json({
      error: "خطای سرور",
      details: err.message,
    });
  }
});

app.delete("/api/admin/users/:id/premium", auth, admin, async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("users")
      .update({
        premium_plan: null,
        premium_until: null,
      })
      .eq("id", id)
      .select(
        "id, username, display_name, avatar_url, role, is_verified, banned, premium_until, premium_plan"
      )
      .single();

    if (error) {
      return res.status(500).json({
        error: "خطا در غیرفعال کردن پریمیوم",
        details: error.message,
      });
    }

    res.json({
      success: true,
      user: data,
    });
  } catch (err) {
    console.error("REMOVE PREMIUM ERROR:", err);

    res.status(500).json({
      error: "خطای سرور",
      details: err.message,
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
app.get("/api/hashtags/:tag/posts", auth, async (req, res) => {
  try {
    const tag = decodeURIComponent(req.params.tag || "").replace("#", "").trim();

    if (!tag) {
      return res.status(400).json({ error: "هشتگ نامعتبر است" });
    }

    const limit = Math.min(Number(req.query.limit) || 15, 30);
    const page = Math.max(Number(req.query.page) || 1, 1);
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: posts, error } = await supabase
      .from("posts")
      .select("*")
      .ilike("content", `%#${tag}%`)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      return res.status(500).json(error);
    }

    const result = await Promise.all(
      (posts || []).map(async (post) => {
        const { count: likesCount } = await supabase
          .from("likes")
          .select("*", { count: "exact", head: true })
          .eq("post_id", post.id);

        const { count: commentsCount } = await supabase
          .from("comments")
          .select("*", { count: "exact", head: true })
          .eq("post_id", post.id);

        const { data: author } = await supabase
          .from("users")
          .select("id, username, display_name, avatar_url, role, is_verified, premium_until, premium_plan")
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
            author?.role === "admin" ? (likesCount || 0) + 100 : likesCount || 0,
          comments_count: commentsCount || 0,
          views_count:
            author?.role === "admin"
              ? (post.views_count || 0) + 200
              : post.views_count || 0,
          is_liked: !!likeRow,
        };
      })
    );

    res.json(result);
  } catch (err) {
    console.error("HASHTAG POSTS ERROR:", err);

    res.status(500).json({
      error: "خطای سرور",
      details: err.message,
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
        is_verified,
  premium_until,
  premium_plan
      )
    `)
    .eq("id", req.params.id)
    .single();

  if (error) {
    return res.status(404).json(error);
  }

  const responsePost = {
  ...data,
  views_count:
    data.author?.role === "admin"
      ? (data.views_count || 0) + 200
      : data.views_count || 0,
};

res.json(responsePost);
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
app.post("/api/upload/post-media", auth, upload.single("media"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "No file uploaded",
      });
    }

    const mimeType = req.file.mimetype || "";
    const isVideo = mimeType.startsWith("video");
    const bucket = isVideo ? "videos" : "posts";

    const originalName = req.file.originalname || "";
    const extension = originalName.includes(".")
      ? originalName.split(".").pop().toLowerCase()
      : mimeType.split("/")[1] || "jpg";

    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${extension}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, req.file.buffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) {
      console.error("Upload error:", error);
      return res.status(500).json(error);
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);

    res.json({
      success: true,
      url: data.publicUrl,
      type: isVideo ? "video" : "image",
    });
  } catch (err) {
    console.error("Upload server error:", err);

    res.status(500).json({
      error: "Upload failed",
    });
  }
});
app.post("/api/upload/avatar", auth, upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "No file uploaded",
      });
    }

    const mimeType = req.file.mimetype || "";

    if (!mimeType.startsWith("image")) {
      return res.status(400).json({
        error: "Only image files are allowed",
      });
    }

    const originalName = req.file.originalname || "";
    const extension = originalName.includes(".")
      ? originalName.split(".").pop().toLowerCase()
      : mimeType.split("/")[1] || "jpg";

    const fileName = `${req.user.id}-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${extension}`;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(fileName, req.file.buffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) {
      console.error("Avatar upload error:", error);
      return res.status(500).json(error);
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);

    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update({
        avatar_url: data.publicUrl,
      })
      .eq("id", req.user.id)
      .select()
      .single();

    if (updateError) {
      return res.status(500).json(updateError);
    }

    res.json({
      success: true,
      avatar_url: data.publicUrl,
      user: updatedUser,
    });
  } catch (err) {
    console.error("Avatar upload server error:", err);

    res.status(500).json({
      error: "Avatar upload failed",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Castle X running on port ${PORT}`);
});
