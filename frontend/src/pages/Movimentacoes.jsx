import { useEffect, useState } from "react";
import {
  ArrowRightLeft,
  Plus,
  TrendingUp,
  TrendingDown,
  WalletCards,
  Search,
} from "lucide-react";

function Movimentacoes() {
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");
  const [filtroConta, setFiltroConta] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroPeriodo, setFiltroPeriodo] = useState("TODOS");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 5;

  const [contas, setContas] = useState([]);

const [mostrarFormulario, setMostrarFormulario] =
  useState(false);

const [salvando, setSalvando] = useState(false);
const [mensagemFormulario, setMensagemFormulario] =
  useState("");

const [contaId, setContaId] = useState("");
const [valorRealizado, setValorRealizado] = useState("");
const [dataMovimentacao, setDataMovimentacao] =
  useState("");
const [observacao, setObservacao] = useState("");

  async function carregarMovimentacoes() {
    try {
      setCarregando(true);
      setErro("");

      const token = localStorage.getItem("token");

      const resposta = await fetch(
        "http://localhost:3000/api/movimentacoes",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.mensagem ||
            "Não foi possível carregar as movimentações."
        );
      }

      setMovimentacoes(dados);
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  async function carregarContas() {
  try {
    const token = localStorage.getItem("token");

    const resposta = await fetch(
      "http://localhost:3000/api/contas-contabeis",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new Error(
        dados.mensagem ||
          "Não foi possível carregar as contas."
      );
    }

    const contasAtivas = dados.filter(
      (conta) => conta.status === "ATIVA"
    );

    setContas(contasAtivas);
  } catch (error) {
    console.error("Erro ao carregar contas:", error);
  }
}

  useEffect(() => {
  carregarMovimentacoes();
  carregarContas();
}, []);

useEffect(() => {
  setPaginaAtual(1);
}, [busca, filtroConta, filtroTipo, filtroPeriodo]);

function abrirFormulario() {
  setContaId("");
  setValorRealizado("");
  setDataMovimentacao("");
  setObservacao("");
  setMensagemFormulario("");
  setMostrarFormulario(true);
}

function fecharFormulario() {
  if (salvando) {
    return;
  }

  setMostrarFormulario(false);
  setMensagemFormulario("");
}

async function salvarMovimentacao(event) {
  event.preventDefault();

  try {
    setSalvando(true);
    setMensagemFormulario("");

    if (!contaId) {
      setMensagemFormulario("Selecione uma conta.");
      return;
    }

    if (!valorRealizado || Number(valorRealizado) <= 0) {
      setMensagemFormulario(
        "Informe um valor realizado maior que zero."
      );
      return;
    }

    if (!dataMovimentacao) {
      setMensagemFormulario(
        "Informe a data da movimentação."
      );
      return;
    }

    const token = localStorage.getItem("token");

    const resposta = await fetch(
      "http://localhost:3000/api/movimentacoes",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          conta_id: Number(contaId),
          valor_realizado: Number(valorRealizado),
          data_movimentacao: dataMovimentacao,
          observacao: observacao.trim() || null,
        }),
      }
    );

    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new Error(
        dados.mensagem ||
          "Não foi possível registrar a movimentação."
      );
    }

    setMostrarFormulario(false);
    setContaId("");
    setValorRealizado("");
    setDataMovimentacao("");
    setObservacao("");

    await carregarMovimentacoes();
  } catch (error) {
    setMensagemFormulario(error.message);
  } finally {
    setSalvando(false);
  }
}

const hoje = new Date();

const anoAtual = hoje.getFullYear();
const mesAtual = String(hoje.getMonth() + 1).padStart(2, "0");

const competenciaAtual = `${anoAtual}-${mesAtual}`;

const movimentacoesDoMes = movimentacoes.filter((movimentacao) => {
  if (!movimentacao.data_movimentacao) {
    return false;
  }

  const competenciaMovimentacao = String(
    movimentacao.data_movimentacao
  ).slice(0, 7);

  return competenciaMovimentacao === competenciaAtual;
});

const receitasDoMes = movimentacoesDoMes
  .filter((movimentacao) => movimentacao.tipo === "RECEITA")
  .reduce(
    (total, movimentacao) =>
      total + Number(movimentacao.valor_realizado || 0),
    0
  );

const despesasDoMes = movimentacoesDoMes
  .filter((movimentacao) => movimentacao.tipo === "DESPESA")
  .reduce(
    (total, movimentacao) =>
      total + Number(movimentacao.valor_realizado || 0),
    0
  );

const saldoDoMes = receitasDoMes - despesasDoMes;

const quantidadeReceitas = movimentacoesDoMes.filter(
  (movimentacao) => movimentacao.tipo === "RECEITA"
).length;

const quantidadeDespesas = movimentacoesDoMes.filter(
  (movimentacao) => movimentacao.tipo === "DESPESA"
).length;

function formatarValor(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

const movimentacoesFiltradas = movimentacoes.filter(
  (movimentacao) => {
    const termo = busca.trim().toLowerCase();

    const correspondeBusca =
      !termo ||
      String(movimentacao.conta || "")
        .toLowerCase()
        .includes(termo) ||
      String(movimentacao.categoria || "")
        .toLowerCase()
        .includes(termo) ||
      String(movimentacao.observacao || "")
        .toLowerCase()
        .includes(termo);

    const correspondeConta =
      !filtroConta ||
      String(movimentacao.conta_id) === filtroConta;

    const correspondeTipo =
  !filtroTipo ||
  movimentacao.tipo === filtroTipo;

let correspondePeriodo = true;

if (filtroPeriodo !== "TODOS") {
  const dataMovimentacao = new Date(
    `${String(movimentacao.data_movimentacao).slice(0, 10)}T12:00:00`
  );

  const hoje = new Date();

  if (filtroPeriodo === "MES_ATUAL") {
    correspondePeriodo =
      dataMovimentacao.getMonth() === hoje.getMonth() &&
      dataMovimentacao.getFullYear() === hoje.getFullYear();
  }

  if (filtroPeriodo === "MES_ANTERIOR") {
    const mesAnterior = new Date(
      hoje.getFullYear(),
      hoje.getMonth() - 1,
      1
    );

    correspondePeriodo =
      dataMovimentacao.getMonth() === mesAnterior.getMonth() &&
      dataMovimentacao.getFullYear() ===
        mesAnterior.getFullYear();
  }

  if (filtroPeriodo === "ULTIMOS_3_MESES") {
    const inicioPeriodo = new Date(
      hoje.getFullYear(),
      hoje.getMonth() - 2,
      1
    );

    correspondePeriodo =
      dataMovimentacao >= inicioPeriodo &&
      dataMovimentacao <= hoje;
  }

  if (filtroPeriodo === "ANO_ATUAL") {
    correspondePeriodo =
      dataMovimentacao.getFullYear() === hoje.getFullYear();
  }
}

return (
  correspondeBusca &&
  correspondeConta &&
  correspondeTipo &&
  correspondePeriodo
);
  }
);

const totalPaginas = Math.max(
  1,
  Math.ceil(movimentacoesFiltradas.length / itensPorPagina)
);

const indiceInicial = (paginaAtual - 1) * itensPorPagina;

const indiceFinal = indiceInicial + itensPorPagina;

const movimentacoesPaginadas =
  movimentacoesFiltradas.slice(
    indiceInicial,
    indiceFinal
  );

  const primeiroItem =
  movimentacoesFiltradas.length === 0
    ? 0
    : indiceInicial + 1;

const ultimoItem = Math.min(
  indiceFinal,
  movimentacoesFiltradas.length
);

  return (
    <div className="transactions-page">
      <div className="categories-header">
        <div>
          <h1>Movimentações</h1>
          <p>
            Registre e acompanhe suas movimentações financeiras.
          </p>
        </div>

        <button
  type="button"
  className="categories-new-button"
  onClick={abrirFormulario}
>
  <Plus size={17} />
  Nova Movimentação
</button>
</div>

      <section className="transactions-summary">
        <div className="transactions-summary-card">
          <div className="transactions-summary-icon transactions-summary-income">
            <TrendingUp size={24} strokeWidth={2} />
          </div>

          <div>
            <span>Receitas no mês</span>

            <strong className="transactions-summary-value income">
              {formatarValor(receitasDoMes)}
            </strong>

            <p>
              {quantidadeReceitas}{" "}
              {quantidadeReceitas === 1
                ? "movimentação"
                : "movimentações"}
            </p>
          </div>
        </div>

        <div className="transactions-summary-card">
          <div className="transactions-summary-icon transactions-summary-expense">
            <TrendingDown size={24} strokeWidth={2} />
          </div>

          <div>
            <span>Despesas no mês</span>

            <strong className="transactions-summary-value expense">
              {formatarValor(despesasDoMes)}
            </strong>

            <p>
              {quantidadeDespesas}{" "}
              {quantidadeDespesas === 1
                ? "movimentação"
                : "movimentações"}
            </p>
          </div>
        </div>

        <div className="transactions-summary-card">
          <div className="transactions-summary-icon transactions-summary-balance">
            <WalletCards size={24} strokeWidth={2} />
          </div>

          <div>
            <span>Saldo do mês</span>

            <strong
              className={`transactions-summary-value ${
                saldoDoMes >= 0 ? "balance-positive" : "balance-negative"
              }`}
            >
              {formatarValor(saldoDoMes)}
            </strong>

            <p>Receitas - Despesas</p>
          </div>
        </div>
      </section>

<div className="transactions-filters">
  <div className="transactions-search">
    <Search size={19} strokeWidth={1.8} />

    <input
      type="text"
      value={busca}
      onChange={(event) => setBusca(event.target.value)}
      placeholder="Buscar por conta, categoria ou observação..."
      aria-label="Buscar movimentações"
    />
  </div>

  <select
  className="transactions-filter-select"
  value={filtroConta}
  onChange={(event) => setFiltroConta(event.target.value)}
  aria-label="Filtrar por conta"
>
  <option value="">Todas as contas</option>

  {contas.map((conta) => (
    <option key={conta.id} value={String(conta.id)}>
      {conta.nome}
    </option>
  ))}
</select>

<select
  className="transactions-filter-select transactions-filter-type"
  value={filtroTipo}
  onChange={(event) => setFiltroTipo(event.target.value)}
  aria-label="Filtrar por tipo"
>
  <option value="">Todos os tipos</option>
  <option value="RECEITA">Receita</option>
  <option value="DESPESA">Despesa</option>
</select>

<select
  className="transactions-filter-select transactions-filter-period"
  value={filtroPeriodo}
  onChange={(event) => setFiltroPeriodo(event.target.value)}
  aria-label="Filtrar por período"
>
  <option value="TODOS">Todo o período</option>
  <option value="MES_ATUAL">Este mês</option>
  <option value="MES_ANTERIOR">Mês anterior</option>
  <option value="ULTIMOS_3_MESES">Últimos 3 meses</option>
  <option value="ANO_ATUAL">Este ano</option>
</select>

</div>

{mostrarFormulario && (
  <div
    className="categories-modal-overlay"
    onMouseDown={(event) => {
      if (
        event.target === event.currentTarget &&
        !salvando
      ) {
        fecharFormulario();
      }
    }}
  >
    <section
      className="categories-modal account-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="transactionModalTitle"
    >
      <div className="categories-modal-header">
        <div className="categories-modal-title">
          <div className="categories-modal-icon">
            <ArrowRightLeft size={20} strokeWidth={1.9} />
          </div>

          <div>
            <h2 id="transactionModalTitle">
              Nova Movimentação
            </h2>

            <p>
              Registre uma movimentação financeira realizada.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="categories-modal-close"
          onClick={fecharFormulario}
          disabled={salvando}
          aria-label="Fechar"
        >
          ×
        </button>
      </div>

      <form
  className="categories-modal-form"
  onSubmit={salvarMovimentacao}
>
        <div className="categories-form-group">
          <label htmlFor="contaMovimentacao">
            Conta
            <span className="required-mark">*</span>
          </label>

          <select
            id="contaMovimentacao"
            className="account-select"
            value={contaId}
            onChange={(event) =>
              setContaId(event.target.value)
            }
          >
            <option value="">
              Selecione uma conta
            </option>

            {contas.map((conta) => (
              <option
                key={conta.id}
                value={conta.id}
              >
                {conta.nome} —{" "}
                {conta.tipo === "RECEITA"
                  ? "Receita"
                  : "Despesa"}
              </option>
            ))}
          </select>
        </div>

        <div className="account-form-two-columns">
          <div className="categories-form-group">
            <label htmlFor="valorRealizado">
              Valor Realizado
              <span className="required-mark">*</span>
            </label>

            <div className="account-input-prefix">
              <span>R$</span>

              <input
                id="valorRealizado"
                type="number"
                min="0.01"
                step="0.01"
                value={valorRealizado}
                onChange={(event) =>
                  setValorRealizado(event.target.value)
                }
                placeholder="0,00"
              />
            </div>
          </div>

          <div className="categories-form-group">
            <label htmlFor="dataMovimentacao">
              Data
              <span className="required-mark">*</span>
            </label>

            <input
              id="dataMovimentacao"
              type="date"
              className="account-date-input"
              value={dataMovimentacao}
              onChange={(event) =>
                setDataMovimentacao(event.target.value)
              }
            />
          </div>
        </div>

        <div className="categories-form-group">
          <label htmlFor="observacaoMovimentacao">
            Observação
            <span className="optional-label">
              Opcional
            </span>
          </label>

          <textarea
            id="observacaoMovimentacao"
            value={observacao}
            onChange={(event) =>
              setObservacao(event.target.value)
            }
            placeholder="Adicione uma observação sobre esta movimentação"
            maxLength={255}
            rows={4}
          />

          <span className="categories-character-count">
            {observacao.length}/255
          </span>
        </div>

        {mensagemFormulario && (
          <div className="categories-message">
            {mensagemFormulario}
          </div>
        )}

        <div className="categories-modal-actions">
          <button
            type="button"
            className="categories-secondary-button"
            onClick={fecharFormulario}
            disabled={salvando}
          >
            Cancelar
          </button>

          <button
  type="submit"
  className="categories-save-button"
  disabled={salvando}
>
  <Plus size={17} />

  {salvando
    ? "Registrando..."
    : "Registrar Movimentação"}
</button>
        </div>
      </form>
    </section>
  </div>
)}

      {carregando ? (
        <div className="categories-state">
          <div className="categories-loader" />
          <p>Carregando movimentações...</p>
        </div>
      ) : erro ? (
        <div className="categories-state categories-state-error">
          <span>!</span>
          <p>{erro}</p>
        </div>
      ) : (
        <section className="categories-list-card categories-list-card-v3">
          <div className="categories-list-header">
            <div>
              <h2>Movimentações recentes</h2>
              <p>
                Consulte as movimentações financeiras registradas.
              </p>
            </div>

            <span className="categories-total">
              {movimentacoes.length}{" "}
              {movimentacoes.length === 1
                ? "movimentação"
                : "movimentações"}
            </span>
          </div>

          {movimentacoes.length === 0 ? (
            <div className="categories-empty-state">
              <div className="categories-empty-icon categories-empty-icon-v3">
                <ArrowRightLeft size={25} strokeWidth={1.7} />
              </div>

              <h3>Nenhuma movimentação registrada</h3>

              <p>
                Registre sua primeira movimentação para começar
                a acompanhar suas finanças.
              </p>
            </div>
          ) : (
            <div className="categories-table-wrapper">
              <table className="categories-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Conta</th>
                    <th>Categoria</th>
                    <th>Tipo</th>
                    <th>Valor</th>
                    <th>Observação</th>
                  </tr>
                </thead>

                <tbody>
                 {movimentacoesPaginadas.map((movimentacao) => (
                    <tr key={movimentacao.id}>
                      <td>
                        {new Date(
                          movimentacao.data_movimentacao
                        ).toLocaleDateString("pt-BR")}
                      </td>

                      <td>
                        <strong>{movimentacao.conta}</strong>
                      </td>

                      <td>{movimentacao.categoria}</td>

                      <td>
                        <span
                          className={`category-badge ${
                            movimentacao.tipo === "RECEITA"
                              ? "category-badge-income"
                              : "category-badge-expense"
                          }`}
                        >
                          {movimentacao.tipo === "RECEITA" ? (
                            <TrendingUp size={14} />
                          ) : (
                            <TrendingDown size={14} />
                          )}

                          {movimentacao.tipo === "RECEITA"
                            ? "Receita"
                            : "Despesa"}
                        </span>
                      </td>

                      <td>
                        <strong>
                          {Number(
                            movimentacao.valor_realizado || 0
                          ).toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </strong>
                      </td>

                      <td>
                        {movimentacao.observacao || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="transactions-pagination">
  <p>
    Mostrando{" "}
    <strong>
      {primeiroItem}-{ultimoItem}
    </strong>{" "}
    de{" "}
    <strong>{movimentacoesFiltradas.length}</strong>{" "}
    {movimentacoesFiltradas.length === 1
      ? "movimentação"
      : "movimentações"}
  </p>

  <div className="transactions-pagination-controls">
    <button
      type="button"
      onClick={() =>
        setPaginaAtual((pagina) =>
          Math.max(1, pagina - 1)
        )
      }
      disabled={paginaAtual === 1}
      aria-label="Página anterior"
    >
      ‹
    </button>

    <span>
      {paginaAtual} de {totalPaginas}
    </span>

    <button
      type="button"
      onClick={() =>
        setPaginaAtual((pagina) =>
          Math.min(totalPaginas, pagina + 1)
        )
      }
      disabled={paginaAtual === totalPaginas}
      aria-label="Próxima página"
    >
      ›
    </button>
  </div>
</div>
        </section>
      )}
    </div>
  );
}

export default Movimentacoes;