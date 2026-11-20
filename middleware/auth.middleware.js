
const crypto = require("crypto");
const db = require("../config/db");
const prisma = db.prisma || db;

const NAMA_COOKIE = "sesi_admin";
const LAMA_SESI_MS = 8 * 60 * 60 * 1000;
const PRODUKSI = process.env.NODE_ENV === "production";

const RAHASIA =
  process.env.AUTH_SECRET || crypto.randomBytes(32).toString("hex");

if (!process.env.AUTH_SECRET) {
  console.warn("[auth] AUTH_SECRET belum diatur di .env");
}

const opsiCookie = {
  httpOnly: true,
  sameSite: "lax",
  secure: PRODUKSI,
  path: "/",
};

const tandaTangan = (data) =>
  crypto.createHmac("sha256", RAHASIA).update(data).digest("base64url");

function buatToken(userId) {
  const isi = Buffer.from(
    JSON.stringify({
      id: userId,
      exp: Date.now() + LAMA_SESI_MS,
    })
  ).toString("base64url");

  return `${isi}.${tandaTangan(isi)}`;
}

function bacaToken(token) {
  if (typeof token !== "string") return null;

  const [isi, ttd] = token.split(".");
  if (!isi || !ttd) return null;

  const a = Buffer.from(ttd);
  const b = Buffer.from(tandaTangan(isi));

  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return null;
  }

  try {
    const data = JSON.parse(
      Buffer.from(isi, "base64url").toString("utf8")
    );

    return data.exp > Date.now() ? data : null;
  } catch {
    return null;
  }
}

function ambilCookie(req, nama) {
  for (const bagian of (req.headers.cookie || "").split(";")) {
    const i = bagian.indexOf("=");

    if (i > 0 && bagian.slice(0, i).trim() === nama) {
      return bagian.slice(i + 1).trim();
    }
  }

  return null;
}

function pasangSesi(res, user) {
  res.cookie(NAMA_COOKIE, buatToken(user.id), {
    ...opsiCookie,
    maxAge: LAMA_SESI_MS,
  });
}

function hapusSesi(res) {
  res.clearCookie(NAMA_COOKIE, opsiCookie);
}

async function userDariRequest(req) {
  const sesi = bacaToken(ambilCookie(req, NAMA_COOKIE));
  if (!sesi) return null;

  return prisma.users.findUnique({
    where: { id: sesi.id },
    select: {
      id: true,
      nama: true,
      email: true,
      role: true,
    },
  });
}

// Semua akun yang sudah login.
async function wajibLogin(req, res, next) {
  try {
    const user = await userDariRequest(req);

    if (user) {
      req.user = user;
      return next();
    }

    if (req.method === "GET" && !req.originalUrl.startsWith("/api/")) {
      return res.redirect("/login.html");
    }

    return res.status(401).json({
      pesan: "Silakan login terlebih dahulu.",
    });
  } catch (err) {
    next(err);
  }
}

// Khusus admin.
async function wajibAdmin(req, res, next) {
  try {
    const user = await userDariRequest(req);

    if (!user) {
      if (req.method === "GET" && !req.originalUrl.startsWith("/api/")) {
        return res.redirect("/login.html");
      }

      return res.status(401).json({
        pesan: "Silakan login terlebih dahulu.",
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        pesan: "Akses ditolak. Khusus administrator.",
      });
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

// Alias untuk kompatibilitas jika masih dipakai di file lain.
const wajibLoginUntukUbah = wajibAdmin;

module.exports = {
  pasangSesi,
  hapusSesi,
  userDariRequest,
  wajibLogin,
  wajibAdmin,
  wajibLoginUntukUbah,
};
