const express = require("express");
const cors = require("cors");
const usuarioRoutes = require("./routes/usuarioRoutes");
const authRoutes = require("./routes/authRoutes");
const categoriaRoutes = require("./routes/categoriaRoutes");
require("dotenv").config();
const pool = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/usuarios", usuarioRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/categorias", categoriaRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "API do FinControl está funcionando!"
  });
});

const PORT = process.env.PORT || 3000;
async function testarConexao() {
  try {
    const connection = await pool.getConnection();
    console.log("Conexão com o MySQL realizada com sucesso!");
    connection.release();
  } catch (error) {
    console.error("Erro ao conectar com o MySQL:", error.message);
  }
}

testarConexao();
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});