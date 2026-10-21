import { useEffect, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

function Relatorios() {
  const hoje = new Date();

  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const ultimoDia = new Date(ano, hoje.getMonth() + 1, 0).getDate();

  const [dataInicio, setDataInicio] = useState(`${ano}-${mes}-01`);

  const [dataFim, setDataFim] = useState(`${ano}-${mes}-${ultimoDia}`);
  const [tipo, setTipo] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [erroCategorias, setErroCategorias] = useState("");
  const [relatorio, setRelatorio] = useState(null);
  const [erroRelatorio, setErroRelatorio] = useState("");
  const [carregandoRelatorio, setCarregandoRelatorio] = useState(false);

  useEffect(() => {
    async function carregarCategorias() {
      try {
        const token = localStorage.getItem("token");

        const resposta = await fetch("http://localhost:3000/api/categorias", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!resposta.ok) {
          throw new Error("Falha ao carregar categorias.");
        }

        const lista = await resposta.json();

        setCategorias(lista);
      } catch (error) {
        console.error("Erro ao buscar categorias:", error);
        setErroCategorias("Não foi possível carregar as categorias.");
      }
    }

    carregarCategorias();
  }, []);
  // Limpar resultados quando os filtros forem alterados
  useEffect(() => {
    setRelatorio(null);
    setErroRelatorio("");
  }, [dataInicio, dataFim, tipo, categoriaId]);
  async function buscarRelatorio() {
    if (!dataInicio || !dataFim || dataInicio > dataFim) {
      setErroRelatorio("Informe um período válido para consultar o relatório.");
      setRelatorio(null);
      return;
    }

    try {
      setCarregandoRelatorio(true);
      setErroRelatorio("");
      setRelatorio(null);

      const token = localStorage.getItem("token");

      const parametros = new URLSearchParams({
        data_inicio: dataInicio,
        data_fim: dataFim,
      });

      if (tipo) {
        parametros.set("tipo", tipo.toUpperCase());
      }

      if (categoriaId) {
        parametros.set("categoria_id", categoriaId);
      }

      const resposta = await fetch(
        `http://localhost:3000/api/relatorios?${parametros.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.mensagem || "Não foi possível gerar o relatório.",
        );
      }

      setRelatorio(dados);
    } catch (error) {
      console.error("Erro ao buscar relatório:", error);
      setErroRelatorio(error.message);
    } finally {
      setCarregandoRelatorio(false);
    }
  }
  return (
    <div className="relatorios-page">
      <div className="profile-heading">
        <h1>Relatórios Financeiros</h1>

        <p>
          Consulte suas movimentações, analise receitas, despesas e resultados
          financeiros por período.
        </p>
      </div>

      <div className="dashboard-filtros">
        <label>
          Data inicial
          <input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
          />
        </label>

        <label>
          Data final
          <input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
          />
        </label>
        <label>
          Tipo de movimentação
          <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="">Todas</option>
            <option value="Receita">Receitas</option>
            <option value="Despesa">Despesas</option>
          </select>
        </label>
        <label>
          Categoria
          <select
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
          >
            <option value="">Todas as categorias</option>

            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nome}
              </option>
            ))}
          </select>
        </label>
        {erroCategorias && <p role="alert">{erroCategorias}</p>}
      </div>

      {/* Botão de consulta dos relatórios */}
      <div style={{ marginTop: "16px" }}>
        <button
          type="button"
          onClick={buscarRelatorio}
          disabled={carregandoRelatorio}
        >
          {carregandoRelatorio ? "Consultando..." : "Filtrar"}
        </button>

        {erroRelatorio && (
          <p role="alert" style={{ color: "#b91c1c" }}>
            {erroRelatorio}
          </p>
        )}

        {relatorio && (
          <p role="status">
            Relatório carregado: {relatorio.movimentacoes.length}{" "}
            {relatorio.movimentacoes.length === 1
              ? "movimentação encontrada."
              : "movimentações encontradas."}
          </p>
        )}
      </div>
      {/* Indicadores financeiros do relatório */}
      {relatorio && (
        <div
          className="dashboard-indicadores"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
            marginTop: "20px",
          }}
        >
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
                <h2>Total de receitas</h2>

                <p>
                  {Number(relatorio.total_receitas).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </p>
              </div>
            </div>
          </div>

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
                <h2>Total de despesas</h2>

                <p>
                  {Number(relatorio.total_despesas).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </p>
              </div>
            </div>
          </div>

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
                <h2>Saldo do período</h2>

                <p
                  style={{
                    color:
                      Number(relatorio.saldo) > 0
                        ? "#16a34a"
                        : Number(relatorio.saldo) < 0
                          ? "#ef4444"
                          : "#64748b",
                  }}
                >
                  {Number(relatorio.saldo).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Resumo financeiro por categoria */}
      {relatorio && (
        <section
          className="dashboard-ultimas-movimentacoes"
          style={{ marginTop: "18px" }}
        >
          <h2>Resumo por categoria</h2>

          {relatorio.agrupamento_categorias.length === 0 ? (
            <p>Nenhuma categoria encontrada no período.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table>
                <thead>
                  <tr>
                    <th>Categoria</th>
                    <th>Receitas</th>
                    <th>Despesas</th>
                    <th>Saldo</th>
                  </tr>
                </thead>

                <tbody>
                  {relatorio.agrupamento_categorias.map((categoria) => (
                    <tr key={categoria.categoria_id}>
                      <td>{categoria.categoria}</td>

                      <td
  style={{
    color:
      Number(categoria.total_receitas) > 0
        ? "#16a34a"
        : "#64748b",
    fontWeight: 700,
  }}
>
  {Number(
    categoria.total_receitas
  ).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })}
</td>

                      <td
  style={{
    color:
      Number(categoria.total_despesas) > 0
        ? "#ef4444"
        : "#64748b",
    fontWeight: 700,
  }}
>
  {Number(
    categoria.total_despesas
  ).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })}
</td>

                      <td
                        style={{
                          color:
                            Number(categoria.saldo) > 0
                              ? "#16a34a"
                              : Number(categoria.saldo) < 0
                                ? "#ef4444"
                                : "#64748b",
                          fontWeight: 700,
                        }}
                      >
                        {Number(categoria.saldo).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
      {/* Detalhamento das movimentações financeiras */}
      {relatorio && (
        <section
          className="dashboard-ultimas-movimentacoes"
          style={{ marginTop: "18px" }}
        >
          <h2>Detalhamento das movimentações</h2>

          {relatorio.movimentacoes.length === 0 ? (
            <p>Nenhuma movimentação encontrada no período.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
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
                  {relatorio.movimentacoes.map((movimentacao) => (
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
                          },
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default Relatorios;
