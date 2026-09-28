const express = require("express");
const autenticarToken = require("../middlewares/authMiddleware");
const {
  registrarMovimentacao
} = require("../controllers/movimentacaoController");

const router = express.Router();

router.post("/", autenticarToken, registrarMovimentacao);

module.exports = router;