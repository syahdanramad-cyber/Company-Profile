const express = require("express");
const router = express.Router();

const contact = require("../controllers/contact.controller");

router.post("/", contact.kirimPesan);

module.exports = router;