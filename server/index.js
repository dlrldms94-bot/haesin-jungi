require("dotenv").config();

const path = require("path");
const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const { query } = require("./db");
const { migrate, SEED } = require("./migrate");

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "haesin0768";
const SESSION_SECRET = process.env.SESSION_SECRET || "haesin-dev-secret";
const publicDir = path.join(__dirname, "..", "public");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2.5 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("이미지 파일만 업로드할 수 있습니다."));
    }
    cb(null, true);
  },
});

app.set("trust proxy", 1);
app.use(express.json({ limit: "3mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    name: "haesin.sid",
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 12,
    },
  })
);

function requireAdmin(req, res, next) {
  if (req.session?.isAdmin) return next();
  return res.status(401).json({ ok: false, error: "로그인이 필요합니다." });
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/works", async (_req, res) => {
  try {
    const { rows } = await query(
      "SELECT id, title, content, image, created_at AS \"createdAt\" FROM works ORDER BY id DESC"
    );
    res.json({ ok: true, posts: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: "실적 목록을 불러오지 못했습니다." });
  }
});

app.post("/api/admin/login", (req, res) => {
  const password = String(req.body?.password || "").trim();
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ ok: false, error: "비밀번호가 올바르지 않습니다." });
  }
  req.session.isAdmin = true;
  res.json({ ok: true });
});

app.post("/api/admin/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("haesin.sid");
    res.json({ ok: true });
  });
});

app.get("/api/admin/me", (req, res) => {
  res.json({ ok: true, isAdmin: Boolean(req.session?.isAdmin) });
});

app.post("/api/works", requireAdmin, upload.single("image"), async (req, res) => {
  try {
    const title = String(req.body?.title || "").trim();
    const content = String(req.body?.content || "").trim();
    if (!title || !content || !req.file) {
      return res.status(400).json({ ok: false, error: "제목, 내용, 이미지가 필요합니다." });
    }

    const image = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    const { rows } = await query(
      `INSERT INTO works (title, content, image)
       VALUES ($1, $2, $3)
       RETURNING id, title, content, image, created_at AS "createdAt"`,
      [title, content, image]
    );
    res.status(201).json({ ok: true, post: rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: "게시글 등록에 실패했습니다." });
  }
});

app.delete("/api/works/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ ok: false, error: "잘못된 ID입니다." });
    }
    await query("DELETE FROM works WHERE id = $1", [id]);
    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: "삭제에 실패했습니다." });
  }
});

app.post("/api/works/reset", requireAdmin, async (_req, res) => {
  try {
    await query("DELETE FROM works");
    for (const item of SEED) {
      await query("INSERT INTO works (title, content, image) VALUES ($1, $2, $3)", [
        item.title,
        item.content,
        item.image,
      ]);
    }
    const { rows } = await query(
      "SELECT id, title, content, image, created_at AS \"createdAt\" FROM works ORDER BY id DESC"
    );
    res.json({ ok: true, posts: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: "초기화에 실패했습니다." });
  }
});

app.use(express.static(publicDir));

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  const file = path.join(publicDir, req.path === "/" ? "index.html" : req.path);
  res.sendFile(file, (err) => {
    if (err) res.status(404).send("Not found");
  });
});

async function start() {
  try {
    await migrate();
  } catch (error) {
    console.error("[boot] migrate failed", error.message);
    if (process.env.DATABASE_URL) {
      process.exit(1);
    }
    console.warn("[boot] continuing without DB (local static only)");
  }

  app.listen(PORT, () => {
    console.log(`[web] http://localhost:${PORT}`);
  });
}

start();
