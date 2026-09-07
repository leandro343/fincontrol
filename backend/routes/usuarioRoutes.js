const express = require("express");
const router = express.Router();
const autenticarToken = require("../middlewares/authMiddleware");
const {
  cadastrarUsuario,
  buscarUsuarioPorId,
  atualizarUsuario,
  excluirUsuario
} = require("../controllers/usuarioController");

router.post("/", cadastrarUsuario);
router.get("/:id", autenticarToken, buscarUsuarioPorId);
router.put("/:id", autenticarToken, atualizarUsuario);
router.delete("/:id", autenticarToken, excluirUsuario);

module.exports = router;