import { useEffect, useState } from "react";
import {
  WalletCards,
  TrendingUp,
  TrendingDown,
  Plus,
  X,
  CalendarDays,
  Landmark,
  Pencil,
  Trash2,
} from "lucide-react";

function Contas() {
  const [contas, setContas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [categorias, setCategorias] = useState([]);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [contaEmEdicao, setContaEmEdicao] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [mensagemFormulario, setMensagemFormulario] = useState("");

  const [contaParaExcluir, setContaParaExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);
  const [mensagemExclusao, setMensagemExclusao] = useState("");

  const [nome, setNome] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [natureza, setNatureza] = useState("FIXA");
  const [recorrencia, setRecorrencia] = useState("MENSAL");
  const [valorPrevisto, setValorPrevisto] = useState("");
  const [diaPrevisto, setDiaPrevisto] = useState("");
  const [dataPrevista, setDataPrevista] = useState("");
  const [status, setStatus] = useState("ATIVA");

  async function carregarContas() {
    try {
      setCarregando(true);
      setErro("");

      const token = localStorage.getItem("token");

      const resposta = await fetch(
        "http://localhost:3000/api/contas-contabeis",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.mensagem || "Não foi possível carregar as contas.",
        );
      }

      setContas(dados);
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  async function carregarCategorias() {
    try {
      const token = localStorage.getItem("token");

      const resposta = await fetch("http://localhost:3000/api/categorias", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.mensagem || "Não foi possível carregar as categorias.",
        );
      }

      setCategorias(dados);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    }
  }

  useEffect(() => {
    carregarContas();
    carregarCategorias();
  }, []);

  function abrirFormularioCadastro() {
    setContaEmEdicao(null);
    setNome("");
    setCategoriaId("");
    setNatureza("FIXA");
    setRecorrencia("MENSAL");
    setValorPrevisto("");
    setDiaPrevisto("");
    setDataPrevista("");
    setStatus("ATIVA");
    setMensagemFormulario("");
    setMostrarFormulario(true);
  }

  function abrirFormularioEdicao(conta) {
    setContaEmEdicao(conta);

    setNome(conta.nome || "");
    setCategoriaId(String(conta.categoria_id || ""));
    setNatureza(conta.natureza || "FIXA");
    setRecorrencia(conta.recorrencia || "MENSAL");
    setValorPrevisto(String(conta.valor_previsto || ""));

    setDiaPrevisto(
      conta.dia_previsto !== null && conta.dia_previsto !== undefined
        ? String(conta.dia_previsto)
        : "",
    );

    setDataPrevista(
      conta.data_prevista ? String(conta.data_prevista).slice(0, 10) : "",
    );

    setStatus(conta.status || "ATIVA");

    setMensagemFormulario("");
    setMostrarFormulario(true);
  }

  function fecharFormulario() {
    if (salvando) {
      return;
    }

    setMostrarFormulario(false);
    setContaEmEdicao(null);
    setMensagemFormulario("");
  }

  function abrirConfirmacaoExclusao(conta) {
    setContaParaExcluir(conta);
    setMensagemExclusao("");
  }

  function cancelarExclusao() {
    if (excluindo) {
      return;
    }

    setContaParaExcluir(null);
    setMensagemExclusao("");
  }

  async function excluirConta() {
    if (!contaParaExcluir) {
      return;
    }

    try {
      setExcluindo(true);
      setMensagemExclusao("");

      const token = localStorage.getItem("token");

      const resposta = await fetch(
        `http://localhost:3000/api/contas-contabeis/${contaParaExcluir.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.mensagem || "Não foi possível excluir a conta.");
      }

      setContaParaExcluir(null);
      await carregarContas();
    } catch (error) {
      setMensagemExclusao(error.message);
    } finally {
      setExcluindo(false);
    }
  }

  async function salvarConta(event) {
    event.preventDefault();

    try {
      setSalvando(true);
      setMensagemFormulario("");

      if (!nome.trim()) {
        setMensagemFormulario("Informe o nome da conta.");
        return;
      }

      if (!categoriaId) {
        setMensagemFormulario("Selecione uma categoria.");
        return;
      }

      if (!valorPrevisto || Number(valorPrevisto) <= 0) {
        setMensagemFormulario("Informe um valor previsto maior que zero.");
        return;
      }

      if (recorrencia === "MENSAL") {
        const dia = Number(diaPrevisto);

        if (!diaPrevisto || dia < 1 || dia > 31) {
          setMensagemFormulario("Informe um dia previsto entre 1 e 31.");
          return;
        }
      }

      if (recorrencia === "EVENTUAL" && !dataPrevista) {
        setMensagemFormulario("Informe a data prevista da conta.");
        return;
      }

      const categoriaSelecionada = categorias.find(
        (categoria) => Number(categoria.id) === Number(categoriaId),
      );

      if (!categoriaSelecionada) {
        setMensagemFormulario("A categoria selecionada não foi encontrada.");
        return;
      }

      const token = localStorage.getItem("token");

      const url = contaEmEdicao
        ? `http://localhost:3000/api/contas-contabeis/${contaEmEdicao.id}`
        : "http://localhost:3000/api/contas-contabeis";

      const resposta = await fetch(url, {
        method: contaEmEdicao ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          categoria_id: Number(categoriaId),
          nome: nome.trim(),
          tipo: categoriaSelecionada.tipo,
          natureza,
          recorrencia,
          status,
          valor_previsto: Number(valorPrevisto),
          dia_previsto: recorrencia === "MENSAL" ? Number(diaPrevisto) : null,
          data_prevista: recorrencia === "EVENTUAL" ? dataPrevista : null,
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.mensagem || "Não foi possível cadastrar a conta.",
        );
      }

      setMostrarFormulario(false);
      await carregarContas();
    } catch (error) {
      setMensagemFormulario(error.message);
    } finally {
      setSalvando(false);
    }
  }

  function formatarValor(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  return (
    <div className="accounts-page">
      <div className="categories-header">
        <div>
          <h1>Contas</h1>
          <p>Gerencie suas receitas e despesas planejadas.</p>
        </div>

        <button
          type="button"
          className="categories-new-button"
          onClick={abrirFormularioCadastro}
        >
          + Nova Conta
        </button>
      </div>

      {mostrarFormulario && (
        <div
          className="categories-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !salvando) {
              fecharFormulario();
            }
          }}
        >
          <section
            className="categories-modal account-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="accountModalTitle"
          >
            <div className="categories-modal-header">
              <div className="categories-modal-title">
                <div className="categories-modal-icon">
                  <WalletCards size={20} strokeWidth={1.9} />
                </div>

                <div>
                  <h2 id="accountModalTitle">
                    {contaEmEdicao ? "Editar Conta" : "Nova Conta"}
                  </h2>

                  <p>
                    {contaEmEdicao
                      ? "Atualize as informações da conta selecionada."
                      : "Cadastre uma receita ou despesa para seu planejamento financeiro."}
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
                <X size={19} />
              </button>
            </div>

            <form onSubmit={salvarConta} className="categories-modal-form">
              <div className="categories-form-group">
                <label htmlFor="nomeConta">
                  Nome da Conta
                  <span className="required-mark">*</span>
                </label>

                <input
                  id="nomeConta"
                  type="text"
                  value={nome}
                  onChange={(event) => setNome(event.target.value)}
                  placeholder="Ex.: Aluguel"
                  maxLength={100}
                  autoFocus
                />
              </div>

              <div className="categories-form-group">
                <label htmlFor="categoriaConta">
                  Categoria
                  <span className="required-mark">*</span>
                </label>

                <select
                  id="categoriaConta"
                  className="account-select"
                  value={categoriaId}
                  onChange={(event) => setCategoriaId(event.target.value)}
                >
                  <option value="">Selecione uma categoria</option>

                  {categorias.map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nome} —{" "}
                      {categoria.tipo === "RECEITA" ? "Receita" : "Despesa"}
                    </option>
                  ))}
                </select>

                {categoriaId && (
                  <div className="account-category-hint">
                    {categorias.find(
                      (categoria) =>
                        Number(categoria.id) === Number(categoriaId),
                    )?.tipo === "RECEITA" ? (
                      <>
                        <TrendingUp size={14} />
                        Esta conta será uma Receita
                      </>
                    ) : (
                      <>
                        <TrendingDown size={14} />
                        Esta conta será uma Despesa
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="account-form-two-columns">
                <div className="categories-form-group">
                  <label htmlFor="naturezaConta">
                    Natureza
                    <span className="required-mark">*</span>
                  </label>

                  <select
                    id="naturezaConta"
                    className="account-select"
                    value={natureza}
                    onChange={(event) => setNatureza(event.target.value)}
                  >
                    <option value="FIXA">Fixa</option>
                    <option value="VARIAVEL">Variável</option>
                  </select>
                </div>

                <div className="categories-form-group">
                  <label htmlFor="recorrenciaConta">
                    Recorrência
                    <span className="required-mark">*</span>
                  </label>

                  <select
                    id="recorrenciaConta"
                    className="account-select"
                    value={recorrencia}
                    onChange={(event) => {
                      const novaRecorrencia = event.target.value;

                      setRecorrencia(novaRecorrencia);

                      if (novaRecorrencia === "MENSAL") {
                        setDataPrevista("");
                      } else {
                        setDiaPrevisto("");
                      }
                    }}
                  >
                    <option value="MENSAL">Mensal</option>
                    <option value="EVENTUAL">Eventual</option>
                  </select>
                </div>
              </div>

              <div className="account-form-two-columns">
                <div className="categories-form-group">
                  <label htmlFor="valorPrevisto">
                    Valor Previsto
                    <span className="required-mark">*</span>
                  </label>

                  <div className="account-input-prefix">
                    <span>R$</span>

                    <input
                      id="valorPrevisto"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={valorPrevisto}
                      onChange={(event) => setValorPrevisto(event.target.value)}
                      placeholder="0,00"
                    />
                  </div>
                </div>

                {recorrencia === "MENSAL" ? (
                  <div className="categories-form-group">
                    <label htmlFor="diaPrevisto">
                      Dia Previsto
                      <span className="required-mark">*</span>
                    </label>

                    <div className="account-input-icon">
                      <CalendarDays size={16} />

                      <input
                        id="diaPrevisto"
                        type="number"
                        min="1"
                        max="31"
                        value={diaPrevisto}
                        onChange={(event) => setDiaPrevisto(event.target.value)}
                        placeholder="Ex.: 10"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="categories-form-group">
                    <label htmlFor="dataPrevista">
                      Data Prevista
                      <span className="required-mark">*</span>
                    </label>

                    <input
                      id="dataPrevista"
                      type="date"
                      className="account-date-input"
                      value={dataPrevista}
                      onChange={(event) => setDataPrevista(event.target.value)}
                    />
                  </div>
                )}
              </div>

              {contaEmEdicao && (
                <div className="categories-form-group">
                  <label htmlFor="statusConta">
                    Status
                    <span className="required-mark">*</span>
                  </label>

                  <select
                    id="statusConta"
                    className="account-select"
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                  >
                    <option value="ATIVA">Ativa</option>
                    <option value="INATIVA">Inativa</option>
                  </select>
                </div>
              )}

              <div className="account-form-info">
                <Landmark size={16} />

                <span>
                  O tipo Receita/Despesa é definido automaticamente pela
                  categoria selecionada.
                </span>
              </div>

              {mensagemFormulario && (
                <div className="categories-message">{mensagemFormulario}</div>
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
                  {contaEmEdicao ? <Pencil size={16} /> : <Plus size={17} />}

                  {salvando
                    ? "Salvando..."
                    : contaEmEdicao
                      ? "Salvar Alterações"
                      : "Salvar Conta"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
      {contaParaExcluir && (
        <div
          className="categories-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !excluindo) {
              cancelarExclusao();
            }
          }}
        >
          <section
            className="categories-modal account-delete-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="accountDeleteTitle"
          >
            <div className="categories-modal-header">
              <div className="categories-modal-title">
                <div className="account-delete-modal-icon">
                  <Trash2 size={20} strokeWidth={1.9} />
                </div>

                <div>
                  <h2 id="accountDeleteTitle">Excluir Conta</h2>

                  <p>Confirme a exclusão da conta selecionada.</p>
                </div>
              </div>

              <button
                type="button"
                className="categories-modal-close"
                onClick={cancelarExclusao}
                disabled={excluindo}
                aria-label="Fechar"
              >
                <X size={19} />
              </button>
            </div>

            <div className="account-delete-body">
              <p>
                Tem certeza de que deseja excluir a conta{" "}
                <strong>"{contaParaExcluir.nome}"</strong>?
              </p>

              <p className="account-delete-warning">
                Esta ação não poderá ser desfeita.
              </p>

              {mensagemExclusao && (
                <div className="categories-error-message">
                  {mensagemExclusao}
                </div>
              )}

              <div className="categories-modal-actions">
                <button
                  type="button"
                  className="categories-secondary-button"
                  onClick={cancelarExclusao}
                  disabled={excluindo}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  className="account-delete-confirm"
                  onClick={excluirConta}
                  disabled={excluindo}
                >
                  <Trash2 size={16} />

                  {excluindo ? "Excluindo..." : "Excluir Conta"}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      <section className="categories-list-card categories-list-card-v3">
        <div className="categories-list-header">
          <div>
            <h2>Contas cadastradas</h2>
            <p>Acompanhe suas contas financeiras e valores previstos.</p>
          </div>

          {!carregando && !erro && (
            <span className="categories-total">
              {contas.length} {contas.length === 1 ? "conta" : "contas"}
            </span>
          )}
        </div>

        {carregando ? (
          <div className="categories-state">
            <div className="categories-loader" />
            <p>Carregando contas...</p>
          </div>
        ) : erro ? (
          <div className="categories-state categories-state-error">
            <span>!</span>
            <p>{erro}</p>
          </div>
        ) : contas.length === 0 ? (
          <div className="categories-empty-state">
            <div className="categories-empty-icon categories-empty-icon-v3">
              <WalletCards size={25} strokeWidth={1.7} />
            </div>

            <h3>Nenhuma conta cadastrada</h3>

            <p>
              Cadastre sua primeira conta para começar seu planejamento
              financeiro.
            </p>
          </div>
        ) : (
          <div className="categories-table-wrapper">
            <table className="categories-table">
              <thead>
                <tr>
                  <th>Conta</th>
                  <th>Categoria</th>
                  <th>Tipo</th>
                  <th>Natureza</th>
                  <th>Recorrência</th>
                  <th>Valor previsto</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {contas.map((conta) => (
                  <tr key={conta.id}>
                    <td>
                      <strong>{conta.nome}</strong>
                    </td>

                    <td>{conta.categoria}</td>

                    <td>
                      <span
                        className={`category-badge ${
                          conta.tipo === "RECEITA"
                            ? "category-badge-income"
                            : "category-badge-expense"
                        }`}
                      >
                        {conta.tipo === "RECEITA" ? (
                          <TrendingUp size={14} />
                        ) : (
                          <TrendingDown size={14} />
                        )}

                        {conta.tipo === "RECEITA" ? "Receita" : "Despesa"}
                      </span>
                    </td>

                    <td>{conta.natureza === "FIXA" ? "Fixa" : "Variável"}</td>

                    <td>
                      {conta.recorrencia === "MENSAL" ? "Mensal" : "Eventual"}
                    </td>

                    <td>
                      <strong>{formatarValor(conta.valor_previsto)}</strong>
                    </td>

                    <td>{conta.status === "ATIVA" ? "Ativa" : "Inativa"}</td>

                    <td>
                      <div className="account-actions">
                        <button
                          type="button"
                          className="account-action-button"
                          onClick={() => abrirFormularioEdicao(conta)}
                          aria-label={`Editar ${conta.nome}`}
                          title="Editar conta"
                        >
                          <Pencil size={16} strokeWidth={1.8} />
                        </button>

                        <button
                          type="button"
                          className="account-action-button account-action-delete"
                          onClick={() => abrirConfirmacaoExclusao(conta)}
                          aria-label={`Excluir ${conta.nome}`}
                          title="Excluir conta"
                        >
                          <Trash2 size={16} strokeWidth={1.8} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default Contas;
