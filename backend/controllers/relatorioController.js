const pool = require("../config/db");

async function gerarRelatorio(req, res) {
  try {
    const usuarioId = req.usuario.id;
    const { data_inicio, data_fim } = req.query;

    const formatoData = /^\d{4}-\d{2}-\d{2}$/;

    function dataValida(data) {
      if (typeof data !== "string" || !formatoData.test(data)) {
        return false;
      }

      const [ano, mes, dia] = data.split("-").map(Number);

      const dataVerificada = new Date(Date.UTC(ano, mes - 1, dia));

      return (
        dataVerificada.getUTCFullYear() === ano &&
        dataVerificada.getUTCMonth() === mes - 1 &&
        dataVerificada.getUTCDate() === dia
      );
    }

    if (
      !dataValida(data_inicio) ||
      !dataValida(data_fim) ||
      data_inicio > data_fim
    ) {
      return res.status(400).json({
        mensagem:
          "Informe um período válido com data_inicio e data_fim no formato AAAA-MM-DD.",
      });
    }

    const { tipo } = req.query;

    if (tipo !== undefined && tipo !== "RECEITA" && tipo !== "DESPESA") {
      return res.status(400).json({
        mensagem: "O filtro tipo deve ser RECEITA ou DESPESA.",
      });
    }

    const { categoria_id } = req.query;

    if (
      categoria_id !== undefined &&
      (typeof categoria_id !== "string" ||
        !/^[1-9]\d*$/.test(categoria_id) ||
        !Number.isSafeInteger(Number(categoria_id)))
    ) {
      return res.status(400).json({
        mensagem: "O filtro categoria_id deve ser um número inteiro positivo.",
      });
    }
    const [movimentacoes] = await pool.query(
      `SELECT
     mf.id,
     mf.conta_id,
     cc.nome AS conta,
     cc.tipo,
     cc.natureza,
     c.id AS categoria_id,
     c.nome AS categoria,
     mf.valor_realizado,
     DATE_FORMAT(
       mf.data_movimentacao,
       '%Y-%m-%d'
     ) AS data_movimentacao,
     mf.observacao

   FROM movimentacoes_financeiras mf

   INNER JOIN contas_contabeis cc
     ON cc.id = mf.conta_id

   INNER JOIN categorias c
     ON c.id = cc.categoria_id

   WHERE cc.usuario_id = ?
  AND mf.data_movimentacao >= ?
  AND mf.data_movimentacao < DATE_ADD(?, INTERVAL 1 DAY)
  AND (? IS NULL OR cc.tipo = ?)
  AND (? IS NULL OR cc.categoria_id = ?)

ORDER BY mf.data_movimentacao DESC, mf.id DESC`,
      [
        usuarioId,
        data_inicio,
        data_fim,
        tipo || null,
        tipo || null,
        categoria_id ? Number(categoria_id) : null,
        categoria_id ? Number(categoria_id) : null,
      ],
    );

    const totaisEmCentavos = movimentacoes.reduce(
      (acumulador, movimentacao) => {
        const valorEmCentavos = Math.round(
          Number(movimentacao.valor_realizado) * 100,
        );

        if (movimentacao.tipo === "RECEITA") {
          acumulador.receitas += valorEmCentavos;
        } else if (movimentacao.tipo === "DESPESA") {
          acumulador.despesas += valorEmCentavos;
        }

        return acumulador;
      },
      {
        receitas: 0,
        despesas: 0,
      },
    );

    const totalReceitas = totaisEmCentavos.receitas / 100;
    const totalDespesas = totaisEmCentavos.despesas / 100;
    const saldo = (totaisEmCentavos.receitas - totaisEmCentavos.despesas) / 100;
    const categoriasAgrupadas = new Map();

    for (const movimentacao of movimentacoes) {
      const categoriaId = Number(movimentacao.categoria_id);

      if (!categoriasAgrupadas.has(categoriaId)) {
        categoriasAgrupadas.set(categoriaId, {
          categoria_id: categoriaId,
          categoria: movimentacao.categoria,
          receitas_centavos: 0,
          despesas_centavos: 0,
        });
      }

      const grupo = categoriasAgrupadas.get(categoriaId);

      const valorEmCentavos = Math.round(
        Number(movimentacao.valor_realizado) * 100,
      );

      if (movimentacao.tipo === "RECEITA") {
        grupo.receitas_centavos += valorEmCentavos;
      } else if (movimentacao.tipo === "DESPESA") {
        grupo.despesas_centavos += valorEmCentavos;
      }
    }

    const agrupamentoCategorias = Array.from(categoriasAgrupadas.values()).map(
      (grupo) => ({
        categoria_id: grupo.categoria_id,
        categoria: grupo.categoria,
        total_receitas: grupo.receitas_centavos / 100,
        total_despesas: grupo.despesas_centavos / 100,
        saldo: (grupo.receitas_centavos - grupo.despesas_centavos) / 100,
      }),
    );
    return res.status(200).json({
      total_receitas: totalReceitas,
      total_despesas: totalDespesas,
      saldo: saldo,
      agrupamento_categorias: agrupamentoCategorias,
      movimentacoes: movimentacoes,
    });
  } catch (error) {
    console.error("Erro ao gerar relatório financeiro:", error);

    return res.status(500).json({
      mensagem: "Erro interno do servidor.",
    });
  }
}

module.exports = {
  gerarRelatorio,
};
