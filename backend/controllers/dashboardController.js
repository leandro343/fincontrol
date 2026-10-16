const pool = require("../config/db");
function obterDataPrevistaMensal(ano, mes, diaPrevisto) {
  const ultimoDiaDoMes = new Date(Date.UTC(ano, mes, 0)).getUTCDate();

  const diaAjustado = Math.min(diaPrevisto, ultimoDiaDoMes);

  return new Date(Date.UTC(ano, mes - 1, diaAjustado));
}

async function acessarDashboard(req, res) {
  try {
    const usuarioId = req.usuario.id;
    const { data_inicio, data_fim } = req.query;
    const formatoData = /^\d{4}-\d{2}-\d{2}$/;

    function dataValida(data) {
      if (!formatoData.test(data)) return false;

      const [ano, mes, dia] = data.split("-").map(Number);
      const dataVerificada = new Date(Date.UTC(ano, mes - 1, dia));

      return (
        dataVerificada.getUTCFullYear() === ano &&
        dataVerificada.getUTCMonth() === mes - 1 &&
        dataVerificada.getUTCDate() === dia
      );
    }

    if (
      !data_inicio ||
      !data_fim ||
      !dataValida(data_inicio) ||
      !dataValida(data_fim) ||
      data_inicio > data_fim
    ) {
      return res.status(400).json({
        mensagem:
          "Informe um período válido com data_inicio e data_fim no formato AAAA-MM-DD.",
      });
    }

    const [resultados] = await pool.query(
      `SELECT
         COALESCE(SUM(
           CASE
             WHEN cc.tipo = 'RECEITA'
             THEN mf.valor_realizado
             ELSE 0
           END
         ), 0) AS receitas_realizadas,

         COALESCE(SUM(
           CASE
             WHEN cc.tipo = 'DESPESA'
             THEN mf.valor_realizado
             ELSE 0
           END
         ), 0) AS despesas_realizadas

       FROM movimentacoes_financeiras mf
       INNER JOIN contas_contabeis cc
         ON cc.id = mf.conta_id
       WHERE cc.usuario_id = ?
        AND mf.data_movimentacao >= ?
        AND mf.data_movimentacao < DATE_ADD(?, INTERVAL 1 DAY)`,
      [usuarioId, data_inicio, data_fim],
    );

    const receitasRealizadas = Number(resultados[0].receitas_realizadas);

    const despesasRealizadas = Number(resultados[0].despesas_realizadas);

    const saldoRealizado = receitasRealizadas - despesasRealizadas;
    const [contasPrevistas] = await pool.query(
      `SELECT
     id,
     tipo,
     recorrencia,
     valor_previsto,
     dia_previsto,
     DATE_FORMAT(data_prevista, '%Y-%m-%d') AS data_prevista
   FROM contas_contabeis
   WHERE usuario_id = ?
     AND status = 'ATIVA'`,
      [usuarioId],
    );

    let receitasPrevistas = 0;
    let despesasPrevistas = 0;

    for (const conta of contasPrevistas) {
      if (conta.recorrencia !== "EVENTUAL") {
        continue;
      }

      if (!conta.data_prevista) {
        continue;
      }

      if (conta.data_prevista < data_inicio || conta.data_prevista > data_fim) {
        continue;
      }

      const valor = Number(conta.valor_previsto);

      if (conta.tipo === "RECEITA") {
        receitasPrevistas += valor;
      } else if (conta.tipo === "DESPESA") {
        despesasPrevistas += valor;
      }
    }

    const inicio = new Date(`${data_inicio}T00:00:00Z`);
    const fim = new Date(`${data_fim}T00:00:00Z`);

    const mesAtual = new Date(
      Date.UTC(inicio.getUTCFullYear(), inicio.getUTCMonth(), 1),
    );

    while (mesAtual <= fim) {
      const ano = mesAtual.getUTCFullYear();
      const mes = mesAtual.getUTCMonth() + 1;

      for (const conta of contasPrevistas) {
        if (conta.recorrencia !== "MENSAL" || conta.dia_previsto == null) {
          continue;
        }

        const dataPrevista = obterDataPrevistaMensal(
          ano,
          mes,
          Number(conta.dia_previsto),
        )
          .toISOString()
          .slice(0, 10);

        if (dataPrevista < data_inicio || dataPrevista > data_fim) {
          continue;
        }

        const valor = Number(conta.valor_previsto);

        if (conta.tipo === "RECEITA") {
          receitasPrevistas += valor;
        } else if (conta.tipo === "DESPESA") {
          despesasPrevistas += valor;
        }
      }

      mesAtual.setUTCMonth(mesAtual.getUTCMonth() + 1);
    }
    const saldoPrevisto = receitasPrevistas - despesasPrevistas;

    return res.status(200).json({
      receitas_realizadas: receitasRealizadas,
      despesas_realizadas: despesasRealizadas,
      saldo_realizado: saldoRealizado,
      receitas_previstas: receitasPrevistas,
      despesas_previstas: despesasPrevistas,
      saldo_previsto: saldoPrevisto,
    });
  } catch (error) {
    console.error("Erro ao acessar Dashboard:", error);

    return res.status(500).json({
      mensagem: "Erro interno do servidor.",
    });
  }
}

module.exports = {
  acessarDashboard,
};
