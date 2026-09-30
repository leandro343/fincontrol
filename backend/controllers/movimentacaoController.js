const pool = require("../config/db");

async function registrarMovimentacao(req, res) {
  try {
    const usuarioId = req.usuario.id;

    const {
      conta_id,
      valor_realizado,
      data_movimentacao,
      observacao
    } = req.body;

    if (!conta_id || valor_realizado === undefined || !data_movimentacao) {
      return res.status(400).json({
        mensagem: "Conta, valor realizado e data da movimentação são obrigatórios."
      });
    }

    if (Number(valor_realizado) <= 0) {
      return res.status(400).json({
        mensagem: "O valor realizado deve ser maior que zero."
      });
    }

    const [contas] = await pool.query(
      `SELECT id, nome, status
       FROM contas_contabeis
       WHERE id = ? AND usuario_id = ?`,
      [conta_id, usuarioId]
    );

    if (contas.length === 0) {
      return res.status(404).json({
        mensagem: "Conta contábil não encontrada."
      });
    }

    if (contas[0].status !== "ATIVA") {
      return res.status(400).json({
        mensagem: "Não é possível registrar movimentação em uma conta inativa."
      });
    }

    const [resultado] = await pool.query(
      `INSERT INTO movimentacoes_financeiras
       (conta_id, valor_realizado, data_movimentacao, observacao)
       VALUES (?, ?, ?, ?)`,
      [
        conta_id,
        valor_realizado,
        data_movimentacao,
        observacao || null
      ]
    );

    return res.status(201).json({
      mensagem: "Movimentação financeira registrada com sucesso!",
      movimentacao: {
        id: resultado.insertId,
        conta_id,
        conta: contas[0].nome,
        valor_realizado,
        data_movimentacao,
        observacao: observacao || null
      }
    });

  } catch (error) {
    console.error("Erro ao registrar movimentação financeira:", error);

    return res.status(500).json({
      mensagem: "Erro interno do servidor."
    });
  }
}

async function listarMovimentacoes(req, res) {
  try {
    const usuarioId = req.usuario.id;

    const [movimentacoes] = await pool.query(
      `SELECT
         mf.id,
         mf.conta_id,
         cc.nome AS conta,
         cc.tipo,
         cc.natureza,
         c.nome AS categoria,
         mf.valor_realizado,
         mf.data_movimentacao,
         mf.observacao,
         mf.created_at
       FROM movimentacoes_financeiras mf
       INNER JOIN contas_contabeis cc
         ON cc.id = mf.conta_id
       INNER JOIN categorias c
         ON c.id = cc.categoria_id
       WHERE cc.usuario_id = ?
       ORDER BY mf.data_movimentacao DESC, mf.id DESC`,
      [usuarioId]
    );

    return res.status(200).json(movimentacoes);
  } catch (error) {
    console.error("Erro ao listar movimentações financeiras:", error);

    return res.status(500).json({
      mensagem: "Erro interno do servidor."
    });
  }
}

module.exports = {
  registrarMovimentacao,
  listarMovimentacoes
};