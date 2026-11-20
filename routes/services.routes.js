const router = require("express").Router();
const c = require("../controllers/services.controller");

router.get("/", c.semua);
router.get("/:id", c.satu);
router.post("/", c.tambah);
router.put("/:id", c.ubah);
router.delete("/:id", c.hapus);

module.exports = router;
