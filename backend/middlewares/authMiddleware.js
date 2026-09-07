const jwt = require("jsonwebtoken");

function autenticarToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      mensagem: "Token não informado."
    });
  }

  const partes = authHeader.split(" ");

  if (partes.length !== 2 || partes[0] !== "Bearer") {
    return res.status(401).json({
      mensagem: "Formato de token inválido."
    });
  }

  const token = partes[1];

  try {
    const dados = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.usuario = dados;

    next();

  } catch (error) {
    return res.status(401).json({
      mensagem: "Token inválido ou expirado."
    });
  }
}

module.exports = autenticarToken;