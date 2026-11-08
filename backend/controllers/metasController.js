
const pool = require("../config/db");

// Valida datas no formato AAAA-MM-DD.
function dataValida(valor) {
  if (
    typeof valor !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(valor)
  ) {
    return false;
  }

  const data = new Date(`${valor}T00:00:00Z`);

  return (
    !Number.isNaN(data.getTime()) &&
    data.toISOString().slice(0, 10) === valor
  );
}

// Cadastrar uma nova meta financeira.
async function cadastrarMeta(req, res) {
  try {
    const usuarioId = req.usuario.id;

    const {
      nome,
      valor_objetivo,
      valor_atual = 0,
      data_inicio,
      data_fim
    } = req.body;

    // Verifica os campos obrigatórios.
    if (
      typeof nome !== "string" ||
      !nome.trim() ||
      nome.trim().length > 100 ||
      valor_objetivo === undefined ||
      !data_inicio ||
      !data_fim
    ) {
      return res.status(400).json({
        mensagem: "Informe os dados obrigatórios da meta."
      });
    }

    // Valida os valores monetários com até duas casas decimais.
    const formatoMonetario = /^\d+(\.\d{1,2})?$/;

    if (
      !formatoMonetario.test(String(valor_objetivo)) ||
      !formatoMonetario.test(String(valor_atual))
    ) {
      return res.status(400).json({
        mensagem: "Informe valores monetários válidos."
      });
    }

    const valorObjetivo = Number(valor_objetivo);
    const valorAtual = Number(valor_atual);

    if (
      valorObjetivo <= 0 ||
      valorAtual < 0 ||
      valorObjetivo > 99999999.99 ||
      valorAtual > 99999999.99
    ) {
      return res.status(400).json({
        mensagem: "Os valores da meta são inválidos."
      });
    }

    // Verifica se o período é válido.
    if (
      !dataValida(data_inicio) ||
      !dataValida(data_fim) ||
      data_fim < data_inicio
    ) {
      return res.status(400).json({
        mensagem: "Informe um período válido para a meta."
      });
    }

    // Registra a meta vinculada ao usuário autenticado.
    const [resultado] = await pool.query(
      `INSERT INTO metas_financeiras
       (usuario_id, nome, valor_objetivo, valor_atual,
        data_inicio, data_fim)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        usuarioId,
        nome.trim(),
        valorObjetivo,
        valorAtual,
        data_inicio,
        data_fim
      ]
    );

    return res.status(201).json({
      mensagem: "Meta financeira cadastrada com sucesso!",
      meta: {
        id: resultado.insertId,
        nome: nome.trim(),
        valor_objetivo: valorObjetivo,
        valor_atual: valorAtual,
        data_inicio,
        data_fim
      }
    });

  } catch (error) {
    console.error("Erro ao cadastrar meta:", error);

    return res.status(500).json({
      mensagem: "Erro interno do servidor."
    });
  }
}


 // Listar as metas financeiras do usuário autenticado.
async function listarMetas(req, res) {
  try {
    const usuarioId = req.usuario.id;

    const [metas] = await pool.query(
      `SELECT
        id,
        nome,
        valor_objetivo,
        valor_atual,
        data_inicio,
        data_fim,
        created_at,
        updated_at
       FROM metas_financeiras
       WHERE usuario_id = ?
       ORDER BY id DESC`,
      [usuarioId]
    );

    return res.status(200).json({
      metas
    });

  } catch (error) {
    console.error("Erro ao listar metas:", error);

    return res.status(500).json({
      mensagem: "Erro interno do servidor."
    });
  }
}

 // Atualizar uma meta financeira do usuário autenticado.
async function atualizarMeta(req, res) {
  try {
    const usuarioId = req.usuario.id;
    const metaId = Number(req.params.id);

    const {
      nome,
      valor_objetivo,
      valor_atual,
      data_inicio,
      data_fim
    } = req.body;

    // Validar o identificador da meta.
    if (!Number.isSafeInteger(metaId) || metaId <= 0) {
      return res.status(400).json({
        mensagem: "Identificador da meta inválido."
      });
    }

    // Validar os campos obrigatórios.
    if (
      typeof nome !== "string" ||
      !nome.trim() ||
      nome.trim().length > 100 ||
      valor_objetivo === undefined ||
      valor_atual === undefined ||
      !data_inicio ||
      !data_fim
    ) {
      return res.status(400).json({
        mensagem: "Informe os dados obrigatórios da meta."
      });
    }

    // Validar os valores monetários.
    const formatoMonetario = /^\d+(\.\d{1,2})?$/;

    if (
      !formatoMonetario.test(String(valor_objetivo)) ||
      !formatoMonetario.test(String(valor_atual))
    ) {
      return res.status(400).json({
        mensagem: "Informe valores monetários válidos."
      });
    }

    const valorObjetivo = Number(valor_objetivo);
    const valorAtual = Number(valor_atual);

    if (
      valorObjetivo <= 0 ||
      valorAtual < 0 ||
      valorObjetivo > 99999999.99 ||
      valorAtual > 99999999.99
    ) {
      return res.status(400).json({
        mensagem: "Os valores da meta são inválidos."
      });
    }

    // Validar o período.
    if (
      !dataValida(data_inicio) ||
      !dataValida(data_fim) ||
      data_fim < data_inicio
    ) {
      return res.status(400).json({
        mensagem: "Informe um período válido para a meta."
      });
    }

    // Atualizar somente uma meta do usuário autenticado.
    const [resultado] = await pool.query(
      `UPDATE metas_financeiras
       SET nome = ?,
           valor_objetivo = ?,
           valor_atual = ?,
           data_inicio = ?,
           data_fim = ?
       WHERE id = ? AND usuario_id = ?`,
      [
        nome.trim(),
        valorObjetivo,
        valorAtual,
        data_inicio,
        data_fim,
        metaId,
        usuarioId
      ]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensagem: "Meta financeira não encontrada."
      });
    }

    return res.status(200).json({
      mensagem: "Meta financeira atualizada com sucesso!",
      meta: {
        id: metaId,
        nome: nome.trim(),
        valor_objetivo: valorObjetivo,
        valor_atual: valorAtual,
        data_inicio,
        data_fim
      }
    });

  } catch (error) {
    console.error("Erro ao atualizar meta:", error);

    return res.status(500).json({
      mensagem: "Erro interno do servidor."
    });
  }
}


 // Excluir uma meta financeira do usuário autenticado.
async function excluirMeta(req, res) {
  try {
    const usuarioId = req.usuario.id;
    const metaId = Number(req.params.id);

    // Validar o identificador da meta.
    if (!Number.isSafeInteger(metaId) || metaId <= 0) {
      return res.status(400).json({
        mensagem: "Identificador da meta inválido."
      });
    }

    // Excluir somente uma meta do usuário autenticado.
    const [resultado] = await pool.query(
      `DELETE FROM metas_financeiras
       WHERE id = ? AND usuario_id = ?`,
      [metaId, usuarioId]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensagem: "Meta financeira não encontrada."
      });
    }

    return res.status(200).json({
      mensagem: "Meta financeira excluída com sucesso!"
    });

  } catch (error) {
    console.error("Erro ao excluir meta:", error);

    return res.status(500).json({
      mensagem: "Erro interno do servidor."
    });
  }
}

module.exports = {
  cadastrarMeta,
  listarMetas,
  atualizarMeta,
  excluirMeta
};