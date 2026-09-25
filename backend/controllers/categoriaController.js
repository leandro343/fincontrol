const pool = require("../config/db");

async function cadastrarCategoria(req, res) {
  try {
    const usuarioId = req.usuario.id;
    const { nome, tipo, descricao } = req.body;

    if (!nome || !tipo) {
      return res.status(400).json({
        mensagem: "Nome e tipo são obrigatórios."
      });
    }

    if (tipo !== "RECEITA" && tipo !== "DESPESA") {
      return res.status(400).json({
        mensagem: "O tipo deve ser RECEITA ou DESPESA."
      });
    }

    const [resultado] = await pool.query(
      `INSERT INTO categorias (usuario_id, nome, tipo, descricao)
       VALUES (?, ?, ?, ?)`,
      [usuarioId, nome, tipo, descricao || null]
    );

    return res.status(201).json({
      mensagem: "Categoria cadastrada com sucesso!",
      categoria: {
        id: resultado.insertId,
        nome,
        tipo,
        descricao: descricao || null
      }
    });

  } catch (error) {
    console.error("Erro ao cadastrar categoria:", error);

    return res.status(500).json({
      mensagem: "Erro interno do servidor."
    });
  }
}

async function listarCategorias(req, res) {
  try {
    const usuarioId = req.usuario.id;

    const [categorias] = await pool.query(
      `SELECT id, nome, tipo, descricao, created_at, updated_at
       FROM categorias
       WHERE usuario_id = ?
       ORDER BY nome ASC`,
      [usuarioId]
    );

    return res.status(200).json(categorias);

  } catch (error) {
    console.error("Erro ao listar categorias:", error);

    return res.status(500).json({
      mensagem: "Erro interno do servidor."
    });
  }
}

async function atualizarCategoria(req, res) {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id;
    const { nome, tipo, descricao } = req.body;

    if (!nome || !tipo) {
      return res.status(400).json({
        mensagem: "Nome e tipo são obrigatórios."
      });
    }

    if (tipo !== "RECEITA" && tipo !== "DESPESA") {
      return res.status(400).json({
        mensagem: "O tipo deve ser RECEITA ou DESPESA."
      });
    }

    const [categorias] = await pool.query(
      `SELECT id
       FROM categorias
       WHERE id = ? AND usuario_id = ?`,
      [id, usuarioId]
    );

    if (categorias.length === 0) {
      return res.status(404).json({
        mensagem: "Categoria não encontrada."
      });
    }

    await pool.query(
      `UPDATE categorias
       SET nome = ?, tipo = ?, descricao = ?
       WHERE id = ? AND usuario_id = ?`,
      [nome, tipo, descricao || null, id, usuarioId]
    );

    return res.status(200).json({
      mensagem: "Categoria atualizada com sucesso!",
      categoria: {
        id: Number(id),
        nome,
        tipo,
        descricao: descricao || null
      }
    });

  } catch (error) {
    console.error("Erro ao atualizar categoria:", error);

    return res.status(500).json({
      mensagem: "Erro interno do servidor."
    });
  }
}

async function excluirCategoria(req, res) {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id;

    const [categorias] = await pool.query(
      `SELECT id
       FROM categorias
       WHERE id = ? AND usuario_id = ?`,
      [id, usuarioId]
    );

    if (categorias.length === 0) {
      return res.status(404).json({
        mensagem: "Categoria não encontrada."
      });
    }

    await pool.query(
      `DELETE FROM categorias
       WHERE id = ? AND usuario_id = ?`,
      [id, usuarioId]
    );

    return res.status(200).json({
      mensagem: "Categoria excluída com sucesso!"
    });

  } catch (error) {
    console.error("Erro ao excluir categoria:", error);

    return res.status(500).json({
      mensagem: "Erro interno do servidor."
    });
  }
}

module.exports = {
  cadastrarCategoria,
  listarCategorias,
  atualizarCategoria,
  excluirCategoria
};