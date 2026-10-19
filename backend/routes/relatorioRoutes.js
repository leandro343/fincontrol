const express = require("express");
const autenticarToken = require("../middlewares/authMiddleware");
const { gerarRelatorio } = require("../controllers/relatorioController");

const router = express.Router();

router.get("/", autenticarToken, gerarRelatorio);

module.exports = router;