
const path = require("path");
const express = require("express");

const {
  wajibLogin,
  wajibAdmin,
} = require("./middleware/auth.middleware");

const app = express();
const folderPublic = path.join(__dirname, "public");
const folderPrivate = path.join(__dirname, "private");

app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/contact", require("./routes/contact.routes"));

app.get(["/admin", "/admin.html"], wajibAdmin, (req, res) => {
  res.sendFile(path.join(folderPrivate, "admin.html"));
});

app.use(express.static(folderPublic));

app.use(
  "/api/services",
  (req, res, next) => {
    if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
      return next();
    }

    wajibAdmin(req, res, next);
  },
  require("./routes/services.routes"),
);

const PORT = 3000;
app.listen(PORT, () => console.log(`Server jalan di http://localhost:${PORT}`));

module.exports = app;
