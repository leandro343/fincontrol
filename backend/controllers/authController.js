const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

async function login(req, res) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        mensagem: "E-mail e senha são obrigatórios."
      });
    }

    const [usuarios] = await pool.query(
      "SELECT id, nome, email, senha FROM usuarios WHERE email = ?",
      [email]
    );

    if (usuarios.length === 0) {
      return res.status(401).json({
        mensagem: "E-mail ou senha inválidos."
      });
    }

    const usuario = usuarios[0];

    const senhaCorreta = await bcrypt.compare(
      senha,
      usuario.senha
    );

    if (!senhaCorreta) {
      return res.status(401).json({
        mensagem: "E-mail ou senha inválidos."
      });
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h"
      }
    );

    return res.status(200).json({
      mensagem: "Login realizado com sucesso!",
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email
      }
    });

  } catch (error) {
    console.error("Erro ao realizar login:", error);

    return res.status(500).json({
      mensagem: "Erro interno do servidor."
    });
  }
}

module.exports = {
  login
};