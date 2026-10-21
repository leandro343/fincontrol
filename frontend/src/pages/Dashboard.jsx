import { useEffect, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Target,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import GraficoDespesas from "./GraficoDespesas";

function formatarDataInput(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function Dashboard() {
  const hoje = new Date();

  const [dataInicio, setDataInicio] = useState(
    formatarDataInput(new Date(hoje.getFullYear(), hoje.getMonth(), 1)),
  );

  const [dataFim, setDataFim] = useState(
    formatarDataInput(new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)),
  );

  const [dadosDashboard, setDadosDashboard] = useState(null);

  const [ultimasMovimentacoes, setUltimasMovimentacoes] = useState([]);
  const [categoriasDespesas, setCategoriasDespesas] = useState([]);

  // Buscar indicadores financeiros
  useEffect(() => {
    if (!dataInicio || !dataFim || dataInicio > dataFim) {
      return;
    }

    async function carregarDashboard() {
      try {
        const token = localStorage.getItem("token");

        const resposta = await fetch(
          `http://localhost:3000/api/dashboard?data_inicio=${dataInicio}&data_fim=${dataFim}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const dados = await resposta.json();

        if (!resposta.ok) {
          console.error("Erro ao carregar Dashboard:", dados);
          return;
        }

        console.log("Dados do Dashboard:", dados);

        setDadosDashboard(dados);
      } catch (erro) {
        console.error("Falha na comunicação com a API:", erro);
      }
    }

    carregarDashboard();
  }, [dataInicio, dataFim]);

  // Buscar ultimas movimentacoes financeiras
  useEffect(() => {
    if (!dataInicio || !dataFim || dataInicio > dataFim) {
      return;
    }

    async function carregarMovimentacoes() {
      try {
        const token = localStorage.getItem("token");

        const resposta = await fetch(
          `http://localhost:3000/api/relatorios?data_inicio=${dataInicio}&data_fim=${dataFim}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const relatorio = await resposta.json();

        if (!resposta.ok) {
          console.error("Erro ao buscar movimentações:", relatorio);
          return;
        }

        console.log(
          "Últimas movimentações:",
          relatorio.movimentacoes.slice(0, 5),
        );

        setUltimasMovimentacoes(relatorio.movimentacoes.slice(0, 5));
        setCategoriasDespesas(
          relatorio.agrupamento_categorias.filter(
            (categoria) => Number(categoria.total_despesas) > 0,
          ),
        );
        console.log(
          "Despesas agrupadas por categoria:",
          relatorio.agrupamento_categorias,
        );
      } catch (erro) {
        console.error("Erro ao carregar movimentações:", erro);
      }
    }

    carregarMovimentacoes();
  }, [dataInicio, dataFim]);

  return (
    <div className="dashboard-page">
      {/* Cabeçalho e filtros do Dashboard */}

      <div className="dashboard-topo">
        <div className="profile-heading">
          <h1>Dashboard Financeiro</h1>

          <p>Acompanhe suas receitas, despesas e saldos em um só lugar.</p>
        </div>

        <div className="dashboard-filtros">
          <label htmlFor="data-inicio">Data inicial</label>

          <input
            id="data-inicio"
            type="date"
            value={dataInicio}
            onChange={(event) => setDataInicio(event.target.value)}
          />

          <label htmlFor="data-fim">Data final</label>

          <input
            id="data-fim"
            type="date"
            value={dataFim}
            onChange={(event) => setDataFim(event.target.value)}
          />
        </div>
      </div>

      {/* Indicadores financeiros */}
{dataInicio && dataFim && dataInicio > dataFim ? (
  <p
    role="alert"
    style={{
      color: "#b91c1c",
      fontWeight: 600,
      padding: "16px",
      backgroundColor: "#fef2f2",
      border: "1px solid #fecaca",
      borderRadius: "10px",
    }}
  >
    Período inválido: a data final deve ser igual ou posterior
    à data inicial.
  </p>
) : (
  <>
      <div className="dashboard-indicadores">
                {/* Receitas realizadas */}

        <div className="dashboard-indicador">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                backgroundColor: "#dcfce7",
                color: "#16a34a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <TrendingUp size={24} strokeWidth={2} />
            </div>

            <div>
              <h2>Receitas realizadas</h2>

              <p>
                {dadosDashboard === null
                  ? "Carregando..."
                  : Number(
                      dadosDashboard.receitas_realizadas
                    ).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
              </p>
            </div>
          </div>
        </div>

        {/* Despesas realizadas */}

        <div className="dashboard-indicador dashboard-indicador-despesas">
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "16px",
    }}
  >
    <div
      style={{
        width: "56px",
        height: "56px",
        borderRadius: "50%",
        backgroundColor: "#fee2e2",
        color: "#ef4444",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <TrendingDown size={24} strokeWidth={2} />
    </div>

    <div>
      <h2>Despesas realizadas</h2>

      <p>
        {dadosDashboard === null
          ? "Carregando..."
          : Number(
              dadosDashboard.despesas_realizadas
            ).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
      </p>
    </div>
  </div>
</div>

        {/* Saldo realizado */}

        <div className="dashboard-indicador dashboard-indicador-saldo-realizado">
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "16px",
    }}
  >
    <div
      style={{
        width: "56px",
        height: "56px",
        borderRadius: "50%",
        backgroundColor: "#dbeafe",
        color: "#2563eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Wallet size={24} strokeWidth={2} />
    </div>

    <div>
      <h2>Saldo realizado</h2>

      <p
        style={{
          color:
            dadosDashboard === null
              ? "#64748b"
              : Number(dadosDashboard.saldo_realizado) > 0
                ? "#16a34a"
                : Number(dadosDashboard.saldo_realizado) < 0
                  ? "#ef4444"
                  : "#64748b",
        }}
      >
        {dadosDashboard === null
          ? "Carregando..."
          : Number(dadosDashboard.saldo_realizado).toLocaleString(
              "pt-BR",
              {
                style: "currency",
                currency: "BRL",
              }
            )}
      </p>
    </div>
  </div>
</div>

        {/* Saldo previsto */}

<div className="dashboard-indicador dashboard-indicador-saldo-previsto">
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "16px",
    }}
  >
    <div
      style={{
        width: "56px",
        height: "56px",
        borderRadius: "50%",
        backgroundColor: "#f3e8ff",
        color: "#9333ea",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Target size={24} strokeWidth={2} />
    </div>

    <div>
      <h2>Saldo previsto</h2>

      <p
        style={{
          color:
            dadosDashboard === null
              ? "#64748b"
              : Number(dadosDashboard.saldo_previsto) > 0
                ? "#16a34a"
                : Number(dadosDashboard.saldo_previsto) < 0
                  ? "#ef4444"
                  : "#64748b",
        }}
      >
        {dadosDashboard === null
          ? "Carregando..."
          : Number(dadosDashboard.saldo_previsto).toLocaleString(
              "pt-BR",
              {
                style: "currency",
                currency: "BRL",
              }
            )}
      </p>
    </div>
  </div>
</div>
      </div>

      {/* Graficos financeiros */}
<div className="dashboard-visualizacoes">
      <div className="dashboard-graficos">
        {/* Grafico de receitas e despesas realizadas */}

        <section className="dashboard-grafico-realizado">
          <h2>Receitas x Despesas realizadas</h2>

          {dadosDashboard === null ? (
            <p>Carregando gráfico...</p>
          ) : (
            <>
              <div className="dashboard-grafico-receitas">
                <span>
                  Receitas realizadas:{" "}
                  <strong>
                    {Number(dadosDashboard.receitas_realizadas).toLocaleString(
                      "pt-BR",
                      {
                        style: "currency",
                        currency: "BRL",
                      },
                    )}
                  </strong>
                </span>

                <progress
                  aria-label="Receitas realizadas"
                  value={Number(dadosDashboard.receitas_realizadas)}
                  max={Math.max(
                    1,
                    Number(dadosDashboard.receitas_realizadas),
                    Number(dadosDashboard.despesas_realizadas),
                  )}
                />
              </div>

              <div className="dashboard-grafico-despesas">
                <span>
                  Despesas realizadas:{" "}
                  <strong>
                    {Number(dadosDashboard.despesas_realizadas).toLocaleString(
                      "pt-BR",
                      {
                        style: "currency",
                        currency: "BRL",
                      },
                    )}
                  </strong>
                </span>

                <progress
                  aria-label="Despesas realizadas"
                  value={Number(dadosDashboard.despesas_realizadas)}
                  max={Math.max(
                    1,
                    Number(dadosDashboard.receitas_realizadas),
                    Number(dadosDashboard.despesas_realizadas),
                  )}
                />
              </div>
            </>
          )}
        </section>

        {/* Grafico de receitas e despesas previstas */}

        <section className="dashboard-grafico-realizado dashboard-grafico-previsto">
          <h2>Receitas x Despesas previstas</h2>

          {dadosDashboard === null ? (
            <p>Carregando gráfico...</p>
          ) : (
            <>
              <div className="dashboard-grafico-receitas">
                <span>
                  Receitas previstas:{" "}
                  <strong>
                    {Number(dadosDashboard.receitas_previstas).toLocaleString(
                      "pt-BR",
                      {
                        style: "currency",
                        currency: "BRL",
                      },
                    )}
                  </strong>
                </span>

                <progress
                  aria-label="Receitas previstas"
                  value={Number(dadosDashboard.receitas_previstas)}
                  max={Math.max(
                    1,
                    Number(dadosDashboard.receitas_previstas),
                    Number(dadosDashboard.despesas_previstas),
                  )}
                />
              </div>

              <div className="dashboard-grafico-despesas">
                <span>
                  Despesas previstas:{" "}
                  <strong>
                    {Number(dadosDashboard.despesas_previstas).toLocaleString(
                      "pt-BR",
                      {
                        style: "currency",
                        currency: "BRL",
                      },
                    )}
                  </strong>
                </span>

                <progress
                  aria-label="Despesas previstas"
                  value={Number(dadosDashboard.despesas_previstas)}
                  max={Math.max(
                    1,
                    Number(dadosDashboard.receitas_previstas),
                    Number(dadosDashboard.despesas_previstas),
                  )}
                />
              </div>
            </>
          )}
        </section>
      </div>
      <GraficoDespesas categorias={categoriasDespesas} />
      </div>
      <section className="dashboard-ultimas-movimentacoes">
        <h2>Últimas movimentações</h2>

        {ultimasMovimentacoes.length === 0 ? (
          <p>Nenhuma movimentação encontrada no período.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Conta</th>
                <th>Categoria</th>
                <th>Tipo</th>
                <th>Valor</th>
              </tr>
            </thead>

            <tbody>
              {ultimasMovimentacoes.map((movimentacao) => (
                <tr key={movimentacao.id}>
                  <td>
                    {movimentacao.data_movimentacao
                      .split("-")
                      .reverse()
                      .join("/")}
                  </td>

                  <td>{movimentacao.conta}</td>

                  <td>{movimentacao.categoria}</td>

                  <td>
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "5px",
      padding: "5px 9px",
      borderRadius: "999px",
      backgroundColor:
        movimentacao.tipo === "RECEITA"
          ? "#dcfce7"
          : "#fee2e2",
      color:
        movimentacao.tipo === "RECEITA"
          ? "#16a34a"
          : "#ef4444",
      fontSize: "12px",
      fontWeight: 600,
    }}
  >
    {movimentacao.tipo === "RECEITA" ? (
      <ArrowUpRight size={14} strokeWidth={2} />
    ) : (
      <ArrowDownRight size={14} strokeWidth={2} />
    )}

    {movimentacao.tipo === "RECEITA"
      ? "Receita"
      : "Despesa"}
  </span>
</td>

                  <td
  style={{
    color:
      movimentacao.tipo === "RECEITA"
        ? "#16a34a"
        : "#ef4444",
    fontWeight: 700,
  }}
>
  {Number(movimentacao.valor_realizado).toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  )}
</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
        </>
)}
    </div>
  );
}

export default Dashboard;
