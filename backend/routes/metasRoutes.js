
const express = require("express");
const autenticarToken = require("../middlewares/authMiddleware");

const {
  cadastrarMeta,
  listarMetas,
  atualizarMeta,
  excluirMeta
} = require("../controllers/metasController");

const router = express.Router();

// Cadastrar uma meta financeira.
router.post("/", autenticarToken, cadastrarMeta);

// Listar as metas do usuário autenticado.
router.get("/", autenticarToken, listarMetas);

// Atualizar uma meta financeira.
router.put("/:id", autenticarToken, atualizarMeta);

// Excluir uma meta financeira.
router.delete("/:id", autenticarToken, excluirMeta);

module.exports = router;
