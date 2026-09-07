const pool = require("../config/db");
const bcrypt = require("bcryptjs");

async function cadastrarUsuario(req, res) {
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({
        mensagem: "Nome, e-mail e senha são obrigatórios."
      });
    }

    const [usuariosExistentes] = await pool.query(
      "SELECT id FROM usuarios WHERE email = ?",
      [email]
    );

    if (usuariosExistentes.length > 0) {
      return res.status(409).json({
        mensagem: "Já existe um usuário cadastrado com este e-mail."
      });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const [resultado] = await pool.query(
      "INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)",
      [nome, email, senhaHash]
    );

    return res.status(201).json({
      mensagem: "Usuário cadastrado com sucesso!",
      usuario: {
        id: resultado.insertId,
        nome,
        email
      }
    });

  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error);

    return res.status(500).json({
      mensagem: "Erro interno do servidor."
    });
  }
}

async function listarUsuarios(req, res) {
  try {
    const [usuarios] = await pool.query(
      "SELECT id, nome, email, created_at, updated_at FROM usuarios"
    );

    return res.status(200).json(usuarios);

  } catch (error) {
    console.error("Erro ao listar usuários:", error);

    return res.status(500).json({
      mensagem: "Erro interno do servidor."
    });
  }
}

async function buscarUsuarioPorId(req, res) {
  try {
    const { id } = req.params;
    if (Number(id) !== req.usuario.id) {
  return res.status(403).json({
    mensagem: "Acesso não autorizado a este usuário."
  });
}

    const [usuarios] = await pool.query(
      "SELECT id, nome, email, created_at, updated_at FROM usuarios WHERE id = ?",
      [id]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({
        mensagem: "Usuário não encontrado."
      });
    }

    return res.status(200).json(usuarios[0]);

  } catch (error) {
    console.error("Erro ao buscar usuário:", error);

    return res.status(500).json({
      mensagem: "Erro interno do servidor."
    });
  }
}

async function atualizarUsuario(req, res) {
  try {
    const { id } = req.params;
    if (Number(id) !== req.usuario.id) {
  return res.status(403).json({
    mensagem: "Acesso não autorizado a este usuário."
  });
}
    const { nome, email } = req.body;

    if (!nome || !email) {
      return res.status(400).json({
        mensagem: "Nome e e-mail são obrigatórios."
      });
    }

    const [usuarios] = await pool.query(
      "SELECT id FROM usuarios WHERE id = ?",
      [id]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({
        mensagem: "Usuário não encontrado."
      });
    }

    const [emailExistente] = await pool.query(
      "SELECT id FROM usuarios WHERE email = ? AND id <> ?",
      [email, id]
    );

    if (emailExistente.length > 0) {
      return res.status(409).json({
        mensagem: "Já existe outro usuário cadastrado com este e-mail."
      });
    }

    await pool.query(
      "UPDATE usuarios SET nome = ?, email = ? WHERE id = ?",
      [nome, email, id]
    );

    return res.status(200).json({
      mensagem: "Usuário atualizado com sucesso!",
      usuario: {
        id: Number(id),
        nome,
        email
      }
    });

  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);

    return res.status(500).json({
      mensagem: "Erro interno do servidor."
    });
  }
}

async function excluirUsuario(req, res) {
  try {
    const { id } = req.params;
    if (Number(id) !== req.usuario.id) {
  return res.status(403).json({
    mensagem: "Acesso não autorizado a este usuário."
  });
}

    const [usuarios] = await pool.query(
      "SELECT id FROM usuarios WHERE id = ?",
      [id]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({
        mensagem: "Usuário não encontrado."
      });
    }

    await pool.query(
      "DELETE FROM usuarios WHERE id = ?",
      [id]
    );

    return res.status(200).json({
      mensagem: "Usuário excluído com sucesso!"
    });

  } catch (error) {
    console.error("Erro ao excluir usuário:", error);

    return res.status(500).json({
      mensagem: "Erro interno do servidor."
    });
  }
}

module.exports = {
  cadastrarUsuario,
  listarUsuarios,
  buscarUsuarioPorId,
  atualizarUsuario,
  excluirUsuario
};