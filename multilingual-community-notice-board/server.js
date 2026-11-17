// ------------------------------------------------------------
// BACKEND: A small Express server for the notice board.
// This project uses a JSON file instead of a database so that
// beginners can understand where the data is stored.
// ------------------------------------------------------------

const express = require("express");
const session = require("express-session");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, "data", "notices.json");

app.use(express.json()); // Allows the server to read JSON sent by the browser.
app.use(session({
  secret: "change-this-secret-before-real-deployment",
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: "lax" }
}));

// Serve the HTML, CSS and JavaScript files from the public folder.
app.use(express.static(path.join(__dirname, "public")));

// Demo accounts for the college prototype.
// Do NOT use hard-coded passwords or this simple setup in a real product.
const DEMO_USERS = {
  admin: { password: "admin123", role: "admin", name: "Community Admin" },
  viewer: { password: "viewer123", role: "viewer", name: "Community Member" }
};

// Read notices from the JSON file.
function readNotices() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch (error) {
    return [];
  }
}

// Save notices back to the JSON file.
function saveNotices(notices) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(notices, null, 2));
}

// This middleware blocks routes that only an administrator may use.
function requireAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.status(403).json({ message: "Administrator access required." });
  }
  next();
}

// Login: browser sends a username and password; server checks them.
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const user = DEMO_USERS[username];

  if (!user || user.password !== password) {
    return res.status(401).json({ message: "Incorrect username or password." });
  }

  req.session.user = { username, role: user.role, name: user.name };
  res.json({ user: req.session.user });
});

// Logout ends the current session.
app.post("/api/logout", (req, res) => {
  req.session.destroy(() => res.json({ message: "Logged out." }));
});

// Check whether someone is already logged in.
app.get("/api/me", (req, res) => {
  res.json({ user: req.session.user || null });
});

// Public route: everyone can read published, non-expired notices.
app.get("/api/notices", (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const notices = readNotices().filter(notice =>
    notice.status === "published" && (!notice.expiryDate || notice.expiryDate >= today)
  );
  res.json(notices);
});

// Admin route: retrieve every notice, including drafts and expired notices.
app.get("/api/admin/notices", requireAdmin, (req, res) => {
  res.json(readNotices());
});

// Admin route: create a notice.
app.post("/api/notices", requireAdmin, (req, res) => {
  const { title, category, publishDate, expiryDate, versions } = req.body;

  if (!title || !category || !publishDate || !Array.isArray(versions) || versions.length === 0) {
    return res.status(400).json({ message: "Please provide a title, category, publish date and at least one language version." });
  }

  const notices = readNotices();
  const notice = {
    id: Date.now().toString(),
    title,
    category,
    publishDate,
    expiryDate: expiryDate || "",
    status: "published",
    versions,
    createdBy: req.session.user.name,
    createdAt: new Date().toISOString()
  };

  notices.unshift(notice);
  saveNotices(notices);
  res.status(201).json(notice);
});

// Admin route: update an existing notice.
app.put("/api/notices/:id", requireAdmin, (req, res) => {
  const notices = readNotices();
  const index = notices.findIndex(item => item.id === req.params.id);

  if (index === -1) return res.status(404).json({ message: "Notice not found." });

  notices[index] = { ...notices[index], ...req.body, id: notices[index].id };
  saveNotices(notices);
  res.json(notices[index]);
});

// Admin route: delete a notice.
app.delete("/api/notices/:id", requireAdmin, (req, res) => {
  const notices = readNotices();
  const updated = notices.filter(item => item.id !== req.params.id);

  if (updated.length === notices.length) {
    return res.status(404).json({ message: "Notice not found." });
  }

  saveNotices(updated);
  res.json({ message: "Notice deleted." });
});

app.listen(PORT, () => {
  console.log(`Notice Board is running at http://localhost:${PORT}`);
});