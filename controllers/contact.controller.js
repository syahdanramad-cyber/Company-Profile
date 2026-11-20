const prisma = require("../config/db");

exports.kirimPesan = async (req, res) => {
    try {
        const { nama, email, isi } = req.body;

        if (!nama || !email || !isi) {
            return res.status(400).json({
                pesan: "Semua kolom wajib diisi."
            });
        }

        await prisma.pesan.create({
            data: {
                nama,
                email,
                isi
            }
        });

        res.json({
            sukses: true,
            pesan: "Pesan berhasil disimpan!"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            pesan: "Gagal menyimpan pesan."
        });
    }
};