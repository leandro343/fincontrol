import { useEffect, useState } from "react";
import ModalConfirmacao from "../components/ModalConfirmacao";
import Notificacao from "../components/Notificacao";

function Metas({ onSessaoExpirada }) {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nome, setNome] = useState("");
  const [valorObjetivo, setValorObjetivo] = useState("");
  const [valorAtual, setValorAtual] = useState("0");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [metas, setMetas] = useState([]);
  const [metaEmEdicao, setMetaEmEdicao] = useState(null);
  const [metaParaExcluir, setMetaParaExcluir] = useState(null);
  const [excluindoMeta, setExcluindoMeta] = useState(false);
  const [notificacao, setNotificacao] = useState(null);
  const [carregandoMetas, setCarregandoMetas] = useState(true);
  const [erroMetas, setErroMetas] = useState("");

  function abrirFormularioCadastro() {
    setMetaEmEdicao(null);

    setNome("");
    setValorObjetivo("");
    setValorAtual("0");
    setDataInicio("");
    setDataFim("");

    setMostrarFormulario(true);
  }

  function fecharFormulario() {
    setMostrarFormulario(false);
  }

  function abrirFormularioEdicao(meta) {
    setMetaEmEdicao(meta);

    setNome(meta.nome);
    setValorObjetivo(String(meta.valor_objetivo));
    setValorAtual(String(meta.valor_atual));

    setDataInicio(String(meta.data_inicio).slice(0, 10));

    setDataFim(String(meta.data_fim).slice(0, 10));

    setMostrarFormulario(true);
  }

  async function excluirMeta(meta) {
    setExcluindoMeta(true);

    try {
      const token = localStorage.getItem("token");

      const resposta = await fetch(
        `http://localhost:3000/api/metas/${meta.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (resposta.status === 401) {
        onSessaoExpirada();
        return;
      }

      if (!resposta.ok) {
        const dados = await resposta.json().catch(() => ({}));

        throw new Error(
          dados.mensagem || "Não foi possível excluir a meta financeira.",
        );
      }

      setMetaParaExcluir(null);

      setNotificacao({
        tipo: "sucesso",
        mensagem: "Meta financeira excluída com sucesso!",
      });

      await carregarMetas();
    } catch (erro) {
      setNotificacao({
        tipo: "erro",
        mensagem: erro.message || "Erro ao excluir a meta financeira.",
      });
    } finally {
      setExcluindoMeta(false);
    }
  }

  async function carregarMetas() {
    try {
      setCarregandoMetas(true);
      setErroMetas("");

      const token = localStorage.getItem("token");

      const resposta = await fetch("http://localhost:3000/api/metas", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (resposta.status === 401) {
        onSessaoExpirada();
        return;
      }

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.mensagem || "Não foi possível carregar as metas financeiras.",
        );
      }

      setMetas(dados.metas);
    } catch (erro) {
      console.error("Erro ao carregar metas:", erro);

      setErroMetas(erro.message || "Erro ao conectar com o servidor.");
    } finally {
      setCarregandoMetas(false);
    }
  }

  useEffect(() => {
    carregarMetas();
  }, []);

  async function salvarMeta(event) {
    event.preventDefault();

    const token = localStorage.getItem("token");

    const dadosMeta = {
      nome: nome.trim(),
      valor_objetivo: Number(valorObjetivo),
      valor_atual: Number(valorAtual),
      data_inicio: dataInicio,
      data_fim: dataFim,
    };

    try {
      const editando = metaEmEdicao !== null;

      const url = editando
        ? `http://localhost:3000/api/metas/${metaEmEdicao.id}`
        : "http://localhost:3000/api/metas";

      const metodo = editando ? "PUT" : "POST";

      const resposta = await fetch(url, {
        method: metodo,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dadosMeta),
      });

      if (resposta.status === 401) {
        onSessaoExpirada();
        return;
      }

      const dados = await resposta.json();

      if (!resposta.ok) {
        setNotificacao({
          tipo: "erro",
          mensagem:
            dados.mensagem || "Não foi possível salvar a meta financeira.",
        });

        return;
      }

      setNotificacao({
        tipo: "sucesso",
        mensagem: editando
          ? "Meta financeira atualizada com sucesso!"
          : "Meta financeira cadastrada com sucesso!",
      });

      await carregarMetas();

      setNome("");
      setValorObjetivo("");
      setValorAtual("0");
      setDataInicio("");
      setDataFim("");
      setMetaEmEdicao(null);
      setMostrarFormulario(false);
    } catch (erro) {
      console.error("Erro ao salvar meta:", erro);

      setNotificacao({
        tipo: "erro",
        mensagem: "Erro ao conectar com o servidor. Tente novamente.",
      });
    }
  }

  return (
    <div className="categories-page">
      <div className="categories-header">
        <div>
          <h1 className="metas-page-title">Metas Financeiras</h1>

          <p>Cadastre e acompanhe seus objetivos financeiros.</p>
        </div>

        <button
          type="button"
          className="categories-new-button metas-nova-meta-button"
          onClick={abrirFormularioCadastro}
        >
          <span>+</span>
          Nova Meta
        </button>
      </div>

      <section className="categories-list-card">
        <div className="categories-list-header">
          <div>
            <h2>Metas cadastradas</h2>
            <p>Acompanhe seus objetivos e seu progresso financeiro.</p>
          </div>

          {!carregandoMetas && !erroMetas && (
            <span className="categories-total">
              {metas.length} {metas.length === 1 ? "meta" : "metas"}
            </span>
          )}
        </div>

        {carregandoMetas ? (
          <div className="categories-state">
            <div className="categories-loader" />
            <p>Carregando metas financeiras...</p>
          </div>
        ) : erroMetas ? (
          <div className="categories-state categories-state-error">
            <span>!</span>
            <p>{erroMetas}</p>
          </div>
        ) : metas.length === 0 ? (
          <div className="categories-empty-state">
            <h3>Nenhuma meta cadastrada</h3>
            <p>
              Cadastre sua primeira meta para começar a acompanhar seus
              objetivos financeiros.
            </p>
          </div>
        ) : (
          <div className="metas-lista">
            {metas.map((meta) => {
              const objetivo = Number(meta.valor_objetivo);
              const atual = Number(meta.valor_atual);

              const percentual =
                objetivo > 0 ? Math.round((atual / objetivo) * 100) : 0;

              return (
                <article
                  className={`metas-card metas-card--cor-${Number(meta.id) % 3}`}
                  key={meta.id}
                >
                  <div className="metas-card-cabecalho">
                    <span className="metas-card-icone" aria-hidden="true">
                      <svg
                        viewBox="0 0 24 24"
                        width="20"
                        height="20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="9" />
                        <circle cx="12" cy="12" r="5" />
                        <circle cx="12" cy="12" r="1.5" />
                      </svg>
                    </span>

                    <h3>{meta.nome}</h3>
                    <span
                      className="metas-progresso-circular"
                      style={{
                        "--meta-progresso": `${Math.min(
                          Math.max(percentual, 0),
                          100,
                        )}%`,
                      }}
                      aria-hidden="true"
                    >
                      <span>{percentual}%</span>
                    </span>
                  </div>

                  <p className="metas-valor-atual">
                    <span className="metas-valor-rotulo">Valor acumulado</span>{" "}
                    <strong className="metas-valor-numero">
                      {atual.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </strong>
                  </p>

                  <p className="metas-valor-objetivo">
                    <span className="metas-objetivo-rotulo">Objetivo:</span>{" "}
                    <span className="metas-objetivo-numero">
                      {objetivo.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                  </p>

                  <p className="metas-prazo">
                    Prazo:{" "}
                    {String(meta.data_fim)
                      .slice(0, 10)
                      .split("-")
                      .reverse()
                      .join("/")}
                  </p>

                  <div className="metas-valor-restante">
                    <span>Falta para atingir a meta</span>

                    <strong>
                      {Math.max(objetivo - atual, 0).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </strong>
                  </div>

                  <div className="metas-acoes">
                    <button
                      type="button"
                      className="category-edit-button"
                      onClick={() => abrirFormularioEdicao(meta)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                        style={{ marginRight: 7 }}
                      >
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L9 17l-4 1 1-4Z" />
                      </svg>
                      Editar
                    </button>

                    <button
                      type="button"
                      className="category-delete-button"
                      onClick={() => setMetaParaExcluir(meta)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                        style={{ marginRight: 7 }}
                      >
                        <path d="M3 6h18" />
                        <path d="M8 6V4h8v2" />
                        <path d="M19 6l-1 14H6L5 6" />
                        <path d="M10 10v6" />
                        <path d="M14 10v6" />
                      </svg>
                      Excluir
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <Notificacao
        tipo={notificacao?.tipo}
        mensagem={notificacao?.mensagem}
        onFechar={() => setNotificacao(null)}
      />

      <ModalConfirmacao
        aberto={metaParaExcluir !== null}
        titulo="Excluir Meta Financeira"
        confirmando={excluindoMeta}
        mensagem={
          metaParaExcluir
            ? `Deseja realmente excluir a meta "${metaParaExcluir.nome}"?`
            : ""
        }
        onCancelar={() => setMetaParaExcluir(null)}
        onConfirmar={() => {
          if (metaParaExcluir) {
            excluirMeta(metaParaExcluir);
          }
        }}
      />
      {mostrarFormulario && (
        <div className="categories-modal-overlay">
          <section
            className="categories-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="metaModalTitle"
          >
            <div className="categories-modal-header">
              <div className="categories-modal-title">
                <div className="categories-modal-icon" aria-hidden="true">
                  +
                </div>

                <div>
                  <h2 id="metaModalTitle">
                    {metaEmEdicao
                      ? "Editar Meta Financeira"
                      : "Nova Meta Financeira"}
                  </h2>

                  <p>
                    {metaEmEdicao
                      ? "Atualize as informações da meta selecionada."
                      : "Defina seu objetivo financeiro e o prazo para alcançá-lo."}
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="categories-modal-close"
                onClick={fecharFormulario}
                aria-label="Fechar formulário"
              >
                ×
              </button>
            </div>

            <form className="categories-modal-form" onSubmit={salvarMeta}>
              <div className="categories-form-group">
                <label htmlFor="nomeMeta">
                  Nome da Meta
                  <span className="required-mark">*</span>
                </label>

                <input
                  id="nomeMeta"
                  type="text"
                  value={nome}
                  onChange={(event) => setNome(event.target.value)}
                  placeholder="Ex.: Comprar Notebook"
                  maxLength={100}
                  required
                />
              </div>

              <div className="account-form-two-columns">
                <div className="categories-form-group">
                  <label htmlFor="valorObjetivoMeta">
                    Valor Objetivo
                    <span className="required-mark">*</span>
                  </label>

                  <div className="account-input-prefix">
                    <span>R$</span>

                    <input
                      id="valorObjetivoMeta"
                      type="number"
                      value={valorObjetivo}
                      onChange={(event) => setValorObjetivo(event.target.value)}
                      placeholder="500,00"
                      min="0.01"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div className="categories-form-group">
                  <label htmlFor="valorAtualMeta">
                    Valor Atual
                    <span className="required-mark">*</span>
                  </label>

                  <div className="account-input-prefix">
                    <span>R$</span>

                    <input
                      id="valorAtualMeta"
                      type="number"
                      value={valorAtual}
                      onChange={(event) => setValorAtual(event.target.value)}
                      placeholder="0,00"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="account-form-two-columns">
                <div className="categories-form-group">
                  <label htmlFor="dataInicioMeta">
                    Data de Início
                    <span className="required-mark">*</span>
                  </label>

                  <input
                    id="dataInicioMeta"
                    type="date"
                    className="account-date-input"
                    value={dataInicio}
                    onChange={(event) => setDataInicio(event.target.value)}
                    required
                  />
                </div>

                <div className="categories-form-group">
                  <label htmlFor="dataFimMeta">
                    Data de Término
                    <span className="required-mark">*</span>
                  </label>

                  <input
                    id="dataFimMeta"
                    type="date"
                    className="account-date-input"
                    value={dataFim}
                    onChange={(event) => setDataFim(event.target.value)}
                    min={dataInicio || undefined}
                    required
                  />
                </div>
              </div>

              <div className="categories-modal-actions">
                <button
                  type="button"
                  className="categories-secondary-button"
                  onClick={fecharFormulario}
                >
                  Cancelar
                </button>

                <button type="submit" className="categories-save-button">
                  {metaEmEdicao ? "Salvar Alterações" : "Salvar Meta"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

export default Metas;
