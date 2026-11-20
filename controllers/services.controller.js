const db = require("../config/db");

function cekservices(body) {
  const nama = typeof body?.nama === "string" ? body.nama.trim() : "";
  if (!nama) return "Nama services wajib diisi";
  if (nama.length > 100) return "Nama services maksimal 100 karakter";
  if (body.deskripsi != null && typeof body.deskripsi !== "string")
    return "Deskripsi harus berupa teks";
  return null;
}

// Prisma menolak id yang bukan angka; anggap saja "tidak ditemukan" (null).
function ambilId(req) {
  const id = Number(req.params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

const tidakAda = (res) =>
  res.status(404).json({ error: "services tidak ditemukan" });

exports.semua = async (req, res, next) => {
  try {
    res.json(await db.services.findMany({ orderBy: { id: "asc" } }));
  } catch (err) {
    next(err);
  }
};

exports.satu = async (req, res, next) => {
  try {
    const id = ambilId(req);
    const item = id && (await db.services.findUnique({ where: { id } }));
    if (!item) return tidakAda(res);
    res.json(item);
  } catch (err) {
    next(err);
  }
};

exports.tambah = async (req, res, next) => {
  try {
    const error = cekservices(req.body);
    if (error) return res.status(400).json({ error });

    const item = await db.services.create({
      data: {
        nama: req.body.nama.trim(),
        deskripsi: req.body.deskripsi ?? null,
      },
    });
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

exports.ubah = async (req, res, next) => {
  try {
    const error = cekservices(req.body);
    if (error) return res.status(400).json({ error });

    const id = ambilId(req);
    const data = {
      nama: req.body.nama.trim(),
      deskripsi: req.body.deskripsi ?? null,
    };
    const r = id
      ? await db.services.updateMany({ where: { id }, data })
      : { count: 0 };
    if (r.count === 0) return tidakAda(res);
    res.json({ id, ...data });
  } catch (err) {
    next(err);
  }
};

exports.hapus = async (req, res, next) => {
  try {
    const id = ambilId(req);
    const r = id
      ? await db.services.deleteMany({ where: { id } })
      : { count: 0 };
    if (r.count === 0) return tidakAda(res);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
