const express = require("express");
const autenticarToken = require("../middlewares/authMiddleware");
const {
  registrarMovimentacao,
  listarMovimentacoes
} = require("../controllers/movimentacaoController");

const router = express.Router();

router.post("/", autenticarToken, registrarMovimentacao);
router.get("/", autenticarToken, listarMovimentacoes);

module.exports = router;