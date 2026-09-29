const pool = require("../config/db");

async function cadastrarContaContabil(req, res) {
  try {
    const usuarioId = req.usuario.id;

    const {
      categoria_id,
      nome,
      tipo,
      natureza,
      recorrencia,
      valor_previsto,
      dia_previsto,
      data_prevista
    } = req.body;

    if (
      !categoria_id ||
      !nome ||
      !tipo ||
      !natureza ||
      !recorrencia ||
      valor_previsto === undefined
    ) {
      return res.status(400).json({
        mensagem: "Categoria, nome, tipo, natureza, recorrência e valor previsto são obrigatórios."
      });
    }

    if (tipo !== "RECEITA" && tipo !== "DESPESA") {
      return res.status(400).json({
        mensagem: "O tipo deve ser RECEITA ou DESPESA."
      });
    }

    if (natureza !== "FIXA" && natureza !== "VARIAVEL") {
      return res.status(400).json({
        mensagem: "A natureza deve ser FIXA ou VARIAVEL."
      });
    }

    if (recorrencia !== "MENSAL" && recorrencia !== "EVENTUAL") {
      return res.status(400).json({
        mensagem: "A recorrência deve ser MENSAL ou EVENTUAL."
      });
    }

    const [categorias] = await pool.query(
      `SELECT id, tipo
       FROM categorias
       WHERE id = ? AND usuario_id = ?`,
      [categoria_id, usuarioId]
    );

    if (categorias.length === 0) {
      return res.status(404).json({
        mensagem: "Categoria não encontrada."
      });
    }

    if (categorias[0].tipo !== tipo) {
      return res.status(400).json({
        mensagem: "O tipo da conta deve ser igual ao tipo da categoria."
      });
    }

    const [resultado] = await pool.query(
      `INSERT INTO contas_contabeis
       (
         usuario_id,
         categoria_id,
         nome,
         tipo,
         natureza,
         recorrencia,
         valor_previsto,
         dia_previsto,
         data_prevista
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        usuarioId,
        categoria_id,
        nome,
        tipo,
        natureza,
        recorrencia,
        valor_previsto,
        dia_previsto || null,
        data_prevista || null
      ]
    );

    return res.status(201).json({
      mensagem: "Conta contábil cadastrada com sucesso!",
      conta: {
        id: resultado.insertId,
        categoria_id,
        nome,
        tipo,
        natureza,
        recorrencia,
        valor_previsto,
        dia_previsto: dia_previsto || null,
        data_prevista: data_prevista || null,
        status: "ATIVA"
      }
    });

  } catch (error) {
    console.error("Erro ao cadastrar conta contábil:", error);

    return res.status(500).json({
      mensagem: "Erro interno do servidor."
    });
  }
}

async function listarContasContabeis(req, res) {
  try {
    const usuarioId = req.usuario.id;

    const [contas] = await pool.query(
      `SELECT
         cc.id,
         cc.categoria_id,
         c.nome AS categoria,
         cc.nome,
         cc.tipo,
         cc.natureza,
         cc.recorrencia,
         cc.valor_previsto,
         cc.dia_previsto,
         cc.data_prevista,
         cc.status,
         cc.created_at,
         cc.updated_at
       FROM contas_contabeis cc
       INNER JOIN categorias c ON c.id = cc.categoria_id
       WHERE cc.usuario_id = ?
       ORDER BY cc.nome ASC`,
      [usuarioId]
    );

    return res.status(200).json(contas);

  } catch (error) {
    console.error("Erro ao listar contas contábeis:", error);

    return res.status(500).json({
      mensagem: "Erro interno do servidor."
    });
  }
}

async function atualizarContaContabil(req, res) {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id;

    const {
      categoria_id,
      nome,
      tipo,
      natureza,
      recorrencia,
      valor_previsto,
      dia_previsto,
      data_prevista,
      status
    } = req.body;

    if (
      !categoria_id ||
      !nome ||
      !tipo ||
      !natureza ||
      !recorrencia ||
      valor_previsto === undefined
    ) {
      return res.status(400).json({
        mensagem: "Categoria, nome, tipo, natureza, recorrência e valor previsto são obrigatórios."
      });
    }

    if (tipo !== "RECEITA" && tipo !== "DESPESA") {
      return res.status(400).json({
        mensagem: "O tipo deve ser RECEITA ou DESPESA."
      });
    }

    if (natureza !== "FIXA" && natureza !== "VARIAVEL") {
      return res.status(400).json({
        mensagem: "A natureza deve ser FIXA ou VARIAVEL."
      });
    }

    if (recorrencia !== "MENSAL" && recorrencia !== "EVENTUAL") {
      return res.status(400).json({
        mensagem: "A recorrência deve ser MENSAL ou EVENTUAL."
      });
    }

    if (status && status !== "ATIVA" && status !== "INATIVA") {
      return res.status(400).json({
        mensagem: "O status deve ser ATIVA ou INATIVA."
      });
    }

    const [contas] = await pool.query(
      `SELECT id
       FROM contas_contabeis
       WHERE id = ? AND usuario_id = ?`,
      [id, usuarioId]
    );

    if (contas.length === 0) {
      return res.status(404).json({
        mensagem: "Conta contábil não encontrada."
      });
    }

    const [categorias] = await pool.query(
      `SELECT id, tipo
       FROM categorias
       WHERE id = ? AND usuario_id = ?`,
      [categoria_id, usuarioId]
    );

    if (categorias.length === 0) {
      return res.status(404).json({
        mensagem: "Categoria não encontrada."
      });
    }

    if (categorias[0].tipo !== tipo) {
      return res.status(400).json({
        mensagem: "O tipo da conta deve ser igual ao tipo da categoria."
      });
    }

    await pool.query(
      `UPDATE contas_contabeis
       SET categoria_id = ?,
           nome = ?,
           tipo = ?,
           natureza = ?,
           recorrencia = ?,
           valor_previsto = ?,
           dia_previsto = ?,
           data_prevista = ?,
           status = ?
       WHERE id = ? AND usuario_id = ?`,
      [
        categoria_id,
        nome,
        tipo,
        natureza,
        recorrencia,
        valor_previsto,
        dia_previsto || null,
        data_prevista || null,
        status || "ATIVA",
        id,
        usuarioId
      ]
    );

    return res.status(200).json({
      mensagem: "Conta contábil atualizada com sucesso!",
      conta: {
        id: Number(id),
        categoria_id,
        nome,
        tipo,
        natureza,
        recorrencia,
        valor_previsto,
        dia_previsto: dia_previsto || null,
        data_prevista: data_prevista || null,
        status: status || "ATIVA"
      }
    });

  } catch (error) {
    console.error("Erro ao atualizar conta contábil:", error);

    return res.status(500).json({
      mensagem: "Erro interno do servidor."
    });
  }
}

async function excluirContaContabil(req, res) {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id;

    // Verifica se a conta pertence ao usuário
    const [contas] = await pool.query(
      `SELECT id
       FROM contas_contabeis
       WHERE id = ? AND usuario_id = ?`,
      [id, usuarioId]
    );

    if (contas.length === 0) {
      return res.status(404).json({
        mensagem: "Conta contábil não encontrada."
      });
    }

    // Verifica se existem movimentações vinculadas
    const [movimentacoes] = await pool.query(
      `SELECT id
       FROM movimentacoes_financeiras
       WHERE conta_id = ?
       LIMIT 1`,
      [id]
    );

    if (movimentacoes.length > 0) {
      return res.status(409).json({
        mensagem:
          "Esta conta possui movimentações vinculadas e não pode ser excluída. Você pode inativá-la, se preferir."
      });
    }

    // Sem movimentações, a exclusão é permitida
    await pool.query(
      `DELETE FROM contas_contabeis
       WHERE id = ? AND usuario_id = ?`,
      [id, usuarioId]
    );

    return res.status(200).json({
      mensagem: "Conta contábil excluída com sucesso!"
    });

  } catch (error) {
    console.error("Erro ao excluir conta contábil:", error);

    return res.status(500).json({
      mensagem: "Erro interno do servidor."
    });
  }
}
module.exports = {
  cadastrarContaContabil,
  listarContasContabeis,
  atualizarContaContabil,
  excluirContaContabil
};