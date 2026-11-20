// controllers/auth.controller.js — register, login, logout, dan cek sesi.
const crypto = require("crypto");
const { promisify } = require("util");
const db = require("../config/db");
const prisma = db.prisma || db; // mendukung `module.exports = prisma` maupun `module.exports = { prisma }`
const {
  pasangSesi,
  hapusSesi,
  userDariRequest,
} = require("../middleware/auth.middleware");

const scrypt = promisify(crypto.scrypt);

// ---------- password: scrypt + salt acak ----------
async function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = await scrypt(password, salt, 64);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

async function cocokPassword(password, tersimpan) {
  const [saltHex, hashHex] = tersimpan.split(":");
  const hash = await scrypt(password, Buffer.from(saltHex, "hex"), 64);
  return crypto.timingSafeEqual(hash, Buffer.from(hashHex, "hex"));
}

// Dipakai saat email tidak ditemukan, agar waktu respons sama dan
// penyerang tidak bisa menebak email mana yang terdaftar.
const HASH_PALSU = `${"0".repeat(32)}:${"0".repeat(128)}`;

// ---------- batas percobaan login: 5x gagal → kunci 15 menit ----------
const MAKS_GAGAL = 5;
const JEDA_KUNCI_MS = 15 * 60 * 1000;
const percobaan = new Map();

function terkunci(kunci) {
  const p = percobaan.get(kunci);
  if (!p) return false;
  if (p.sampai < Date.now()) {
    percobaan.delete(kunci);
    return false;
  }
  return p.jumlah >= MAKS_GAGAL;
}

function catatGagal(kunci) {
  const p = percobaan.get(kunci);
  if (!p || p.sampai < Date.now())
    percobaan.set(kunci, { jumlah: 1, sampai: Date.now() + JEDA_KUNCI_MS });
  else p.jumlah += 1;
}

// ---------- validasi ----------
const POLA_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const teks = (v) => (typeof v === "string" ? v.trim() : "");
const dataPublik = (u) => ({
  id: u.id,
  nama: u.nama,
  email: u.email,
  role: u.role,
});
// ---------- handler ----------
exports.register = async (req, res, next) => {
  try {
    const body = req.body || {};
    const nama = teks(body.nama);
    const email = teks(body.email).toLowerCase();
    const password = typeof body.password === "string" ? body.password : "";

    if (!nama || nama.length > 100)
      return res
        .status(400)
        .json({ pesan: "Nama wajib diisi (maks. 100 karakter)." });
    if (!POLA_EMAIL.test(email) || email.length > 100)
      return res.status(400).json({ pesan: "Format email tidak valid." });
    if (password.length < 8 || password.length > 200)
      return res.status(400).json({ pesan: "Password minimal 8 karakter." });

    const sudahAda = await prisma.users.findUnique({ where: { email } });
    if (sudahAda)
      return res.status(409).json({ pesan: "Email sudah terdaftar." });

    const user = await prisma.users.create({
      data: { nama, email, password: await hashPassword(password) },
    });

    pasangSesi(res, user);
    res
      .status(201)
      .json({ pesan: "Registrasi berhasil.", user: dataPublik(user) });
  } catch (err) {
    if (err.code === "P2002")
      return res.status(409).json({ pesan: "Email sudah terdaftar." });
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const body = req.body || {};
    const email = teks(body.email).toLowerCase();
    const password = typeof body.password === "string" ? body.password : "";
    const kunci = `${req.ip}|${email}`;

    if (terkunci(kunci)) {
      return res.status(429).json({
        pesan: "Terlalu banyak percobaan gagal. Coba lagi dalam 15 menit.",
      });
    }
    if (!email || !password)
      return res.status(400).json({ pesan: "Email dan password wajib diisi." });

    const user = await prisma.users.findUnique({ where: { email } });
    const benar = await cocokPassword(
      password,
      user ? user.password : HASH_PALSU,
    );

    if (!user || !benar) {
      catatGagal(kunci);
      return res.status(401).json({ pesan: "Email atau password salah." });
    }

    percobaan.delete(kunci);
    pasangSesi(res, user);
    res.json({ pesan: "Login berhasil.", user: dataPublik(user) });
  } catch (err) {
    next(err);
  }
};

exports.logout = (req, res) => {
  hapusSesi(res);
  res.json({ pesan: "Logout berhasil." });
};

exports.me = async (req, res, next) => {
  try {
    const user = await userDariRequest(req);
    if (!user) return res.status(401).json({ pesan: "Belum login." });
    res.json({ user });
  } catch (err) {
    next(err);
  }
};
