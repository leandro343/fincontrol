const express = require("express");
const autenticarToken = require("../middlewares/authMiddleware");
const {
  cadastrarCategoria,
  listarCategorias,
  atualizarCategoria,
  excluirCategoria
} = require("../controllers/categoriaController");

const router = express.Router();

router.post("/", autenticarToken, cadastrarCategoria);
router.get("/", autenticarToken, listarCategorias);
router.put("/:id", autenticarToken, atualizarCategoria);
router.delete("/:id", autenticarToken, excluirCategoria);

module.exports = router;