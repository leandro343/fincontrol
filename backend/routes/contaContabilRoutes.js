const express = require("express");
const autenticarToken = require("../middlewares/authMiddleware");
const {
  cadastrarContaContabil,
  listarContasContabeis,
  atualizarContaContabil,
  excluirContaContabil
} = require("../controllers/contaContabilController");

const router = express.Router();

router.post("/", autenticarToken, cadastrarContaContabil);
router.get("/", autenticarToken, listarContasContabeis);
router.put("/:id", autenticarToken, atualizarContaContabil);
router.delete("/:id", autenticarToken, excluirContaContabil);

module.exports = router;