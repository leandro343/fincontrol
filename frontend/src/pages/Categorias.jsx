import { useEffect, useState } from "react";

import {
  Search,
  SlidersHorizontal,
  Tag,
  TrendingDown,
  TrendingUp,
  Pencil,
  Trash2,
  Plus,
  TriangleAlert,
  X,
} from "lucide-react";

function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("TODOS");

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [categoriaEmEdicao, setCategoriaEmEdicao] = useState(null);

  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("DESPESA");
  const [descricao, setDescricao] = useState("");

  const [salvando, setSalvando] = useState(false);
  const [mensagemFormulario, setMensagemFormulario] = useState("");

  const [categoriaParaExcluir, setCategoriaParaExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);
  const [mensagemExclusao, setMensagemExclusao] = useState("");

  async function carregarCategorias() {
    try {
      setCarregando(true);
      setErro("");

      const token = localStorage.getItem("token");

      const resposta = await fetch(
        "http://localhost:3000/api/categorias",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(
          dados.mensagem ||
            "Não foi possível carregar as categorias."
        );
        return;
      }

      setCategorias(dados);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
      setErro("Erro ao conectar com o servidor.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarCategorias();
  }, []);

  function limparFormulario() {
    setNome("");
    setTipo("DESPESA");
    setDescricao("");
    setMensagemFormulario("");
    setCategoriaEmEdicao(null);
  }

  function abrirFormularioCadastro() {
    limparFormulario();
    setMostrarFormulario(true);
  }

  function abrirFormularioEdicao(categoria) {
    setCategoriaEmEdicao(categoria);
    setNome(categoria.nome);
    setTipo(categoria.tipo);
    setDescricao(categoria.descricao || "");
    setMensagemFormulario("");
    setMostrarFormulario(true);
  }

  function fecharFormulario() {
    limparFormulario();
    setMostrarFormulario(false);
  }

  async function salvarCategoria(event) {
    event.preventDefault();

    if (!nome.trim()) {
      setMensagemFormulario("Informe o nome da categoria.");
      return;
    }

    try {
      setSalvando(true);
      setMensagemFormulario("");

      const token = localStorage.getItem("token");
      const editando = categoriaEmEdicao !== null;

      const url = editando
        ? `http://localhost:3000/api/categorias/${categoriaEmEdicao.id}`
        : "http://localhost:3000/api/categorias";

      const metodo = editando ? "PUT" : "POST";

      const resposta = await fetch(url, {
        method: metodo,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          nome: nome.trim(),
          tipo,
          descricao: descricao.trim() || null
        })
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        setMensagemFormulario(
          dados.mensagem ||
            "Não foi possível salvar a categoria."
        );
        return;
      }

      await carregarCategorias();
      fecharFormulario();
    } catch (error) {
      console.error("Erro ao salvar categoria:", error);

      setMensagemFormulario(
        "Erro ao conectar com o servidor."
      );
    } finally {
      setSalvando(false);
    }
  }

  function solicitarExclusao(categoria) {
    setCategoriaParaExcluir(categoria);
    setMensagemExclusao("");
  }

  function cancelarExclusao() {
    setCategoriaParaExcluir(null);
    setMensagemExclusao("");
  }

  async function excluirCategoria() {
    if (!categoriaParaExcluir) {
      return;
    }

    try {
      setExcluindo(true);
      setMensagemExclusao("");

      const token = localStorage.getItem("token");

      const resposta = await fetch(
        `http://localhost:3000/api/categorias/${categoriaParaExcluir.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        setMensagemExclusao(
          dados.mensagem ||
            "Não foi possível excluir a categoria."
        );
        return;
      }

      await carregarCategorias();

      setCategoriaParaExcluir(null);
      setMensagemExclusao("");
    } catch (error) {
      console.error("Erro ao excluir categoria:", error);

      setMensagemExclusao(
        "Não foi possível excluir a categoria. Ela pode estar vinculada a uma conta."
      );
       } finally {
      setExcluindo(false);
    }
  }

  const categoriasFiltradas = categorias.filter((categoria) => {
    const termoBusca = busca.trim().toLowerCase();

    const correspondeBusca =
      categoria.nome.toLowerCase().includes(termoBusca) ||
      (categoria.descricao || "").toLowerCase().includes(termoBusca);

    const correspondeTipo =
      filtroTipo === "TODOS" || categoria.tipo === filtroTipo;

    return correspondeBusca && correspondeTipo;
  });

  return (
    <div className="categories-page">
      <div className="categories-header">
        <div>
          <h1>Categorias</h1>
          <p>
            Organize suas receitas e despesas por categorias.
          </p>
        </div>

        <button
          type="button"
          className="categories-new-button"
          onClick={abrirFormularioCadastro}
        >
          <span>+</span>
          Nova Categoria
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
            className="categories-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="categoryModalTitle"
          >
            <div className="categories-modal-header">
              <div className="categories-modal-title">
                <div
                  className={`categories-modal-icon ${
                    categoriaEmEdicao
                      ? "categories-modal-icon-edit"
                      : ""
                  }`}
                >
                  {categoriaEmEdicao ? (
                    <Pencil size={20} strokeWidth={1.9} />
                  ) : (
                    <Plus size={21} strokeWidth={2} />
                  )}
                </div>

                <div>
                  <h2 id="categoryModalTitle">
                    {categoriaEmEdicao
                      ? "Editar Categoria"
                      : "Nova Categoria"}
                  </h2>

                  <p>
                    {categoriaEmEdicao
                      ? "Atualize as informações da categoria selecionada."
                      : "Crie uma categoria para organizar suas movimentações."}
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

            <form
              onSubmit={salvarCategoria}
              className="categories-modal-form"
            >
              <div className="categories-form-group">
                <label htmlFor="nomeCategoria">
                  Nome da Categoria
                  <span className="required-mark">*</span>
                </label>

                <input
                  id="nomeCategoria"
                  type="text"
                  value={nome}
                  onChange={(event) =>
                    setNome(event.target.value)
                  }
                  placeholder="Ex.: Alimentação"
                  maxLength={100}
                  autoFocus
                />
              </div>

              <div className="categories-form-group">
                <label>
                  Tipo
                  <span className="required-mark">*</span>
                </label>

                <div className="categories-type-options categories-type-options-v3">
                  <label
                    className={`category-type-option category-type-income ${
                      tipo === "RECEITA"
                        ? "category-type-option-active"
                        : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="tipoCategoria"
                      value="RECEITA"
                      checked={tipo === "RECEITA"}
                      onChange={(event) =>
                        setTipo(event.target.value)
                      }
                    />

                    <span className="category-type-symbol">
                      <TrendingUp size={19} strokeWidth={2} />
                    </span>

                    <span className="category-type-copy">
                      <strong>Receita</strong>
                      <small>Entradas financeiras</small>
                    </span>

                    <span className="category-type-check">
                      {tipo === "RECEITA" && "✓"}
                    </span>
                  </label>

                  <label
                    className={`category-type-option category-type-expense ${
                      tipo === "DESPESA"
                        ? "category-type-option-active"
                        : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="tipoCategoria"
                      value="DESPESA"
                      checked={tipo === "DESPESA"}
                      onChange={(event) =>
                        setTipo(event.target.value)
                      }
                    />

                    <span className="category-type-symbol">
                      <TrendingDown size={19} strokeWidth={2} />
                    </span>

                    <span className="category-type-copy">
                      <strong>Despesa</strong>
                      <small>Saídas financeiras</small>
                    </span>

                    <span className="category-type-check">
                      {tipo === "DESPESA" && "✓"}
                    </span>
                  </label>
                </div>
              </div>

              <div className="categories-form-group">
                <label htmlFor="descricaoCategoria">
                  Descrição
                  <span className="optional-label">
                    Opcional
                  </span>
                </label>

                <div className="categories-textarea-wrapper">
                  <textarea
                    id="descricaoCategoria"
                    value={descricao}
                    onChange={(event) =>
                      setDescricao(event.target.value)
                    }
                    placeholder="Adicione uma breve descrição para esta categoria"
                    maxLength={255}
                    rows={4}
                  />

                  <span className="categories-character-count">
                    {descricao.length}/255
                  </span>
                </div>
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
                  {categoriaEmEdicao ? (
                    <Pencil size={16} />
                  ) : (
                    <Plus size={17} />
                  )}

                  {salvando
                    ? "Salvando..."
                    : categoriaEmEdicao
                      ? "Salvar Alterações"
                      : "Salvar Categoria"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

            {categoriaParaExcluir && (
        <div
          className="categories-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !excluindo
            ) {
              cancelarExclusao();
            }
          }}
        >
          <section
            className="categories-delete-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="deleteCategoryTitle"
          >
            <button
              type="button"
              className="categories-delete-close"
              onClick={cancelarExclusao}
              disabled={excluindo}
              aria-label="Fechar"
            >
              <X size={19} />
            </button>

            <div className="categories-delete-modal-icon">
              <TriangleAlert size={25} strokeWidth={1.8} />
            </div>

            <div className="categories-delete-modal-content">
              <h2 id="deleteCategoryTitle">
                Excluir categoria?
              </h2>

              <p>
                Tem certeza de que deseja excluir{" "}
                <strong>
                  {categoriaParaExcluir.nome}
                </strong>
                ?
              </p>

              <div className="categories-delete-warning-v3">
                <TriangleAlert size={16} strokeWidth={1.9} />

                <span>
                  Esta ação não poderá ser desfeita.
                </span>
              </div>

              {mensagemExclusao && (
                <div className="categories-error-message">
                  {mensagemExclusao}
                </div>
              )}
            </div>

            <div className="categories-delete-modal-actions">
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
                className="categories-delete-confirm"
                onClick={excluirCategoria}
                disabled={excluindo}
              >
                <Trash2 size={16} strokeWidth={1.9} />

                {excluindo
                  ? "Excluindo..."
                  : "Excluir Categoria"}
              </button>
            </div>
          </section>
        </div>
      )}

      <section className="categories-list-card categories-list-card-v3">
  <div className="categories-list-header">
    <div>
      <h2>Categorias cadastradas</h2>
      <p>
        Gerencie as categorias utilizadas para organizar suas
        movimentações financeiras.
      </p>
    </div>

    {!carregando && !erro && (
      <span className="categories-total">
        {categorias.length}{" "}
        {categorias.length === 1 ? "categoria" : "categorias"}
      </span>
    )}
  </div>

  {!carregando && !erro && categorias.length > 0 && (
    <div className="categories-toolbar">
      <div className="categories-search">
        <Search size={18} strokeWidth={1.8} />

        <input
          type="text"
          value={busca}
          onChange={(event) => setBusca(event.target.value)}
          placeholder="Buscar categorias..."
          aria-label="Buscar categorias"
        />

        {busca && (
          <button
            type="button"
            className="categories-search-clear"
            onClick={() => setBusca("")}
            aria-label="Limpar busca"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="categories-filter">
        <SlidersHorizontal size={17} strokeWidth={1.8} />

        <select
          value={filtroTipo}
          onChange={(event) => setFiltroTipo(event.target.value)}
          aria-label="Filtrar categorias por tipo"
        >
          <option value="TODOS">Todos os tipos</option>
          <option value="RECEITA">Receitas</option>
          <option value="DESPESA">Despesas</option>
        </select>
      </div>
    </div>
  )}

  {carregando ? (
    <div className="categories-state">
      <div className="categories-loader" />
      <p>Carregando categorias...</p>
    </div>
  ) : erro ? (
    <div className="categories-state categories-state-error">
      <span>!</span>
      <p>{erro}</p>
    </div>
  ) : categorias.length === 0 ? (
    <div className="categories-empty-state">
      <div className="categories-empty-icon categories-empty-icon-v3">
        <Tag size={25} strokeWidth={1.7} />
      </div>

      <h3>Nenhuma categoria cadastrada</h3>

      <p>
        Crie sua primeira categoria para começar a organizar
        suas finanças.
      </p>

      <button
        type="button"
        className="categories-new-button"
        onClick={abrirFormularioCadastro}
      >
        <Plus size={18} />
        Nova Categoria
      </button>
    </div>
  ) : categoriasFiltradas.length === 0 ? (
    <div className="categories-empty-state categories-filter-empty">
      <div className="categories-empty-icon categories-empty-icon-v3">
        <Search size={24} strokeWidth={1.7} />
      </div>

      <h3>Nenhuma categoria encontrada</h3>

      <p>
        Tente alterar o termo pesquisado ou o filtro selecionado.
      </p>

      <button
        type="button"
        className="categories-clear-filters"
        onClick={() => {
          setBusca("");
          setFiltroTipo("TODOS");
        }}
      >
        Limpar filtros
      </button>
    </div>
  ) : (
    <div className="categories-table-wrapper">
      <table className="categories-table categories-table-v3">
        <thead>
          <tr>
            <th>Categoria</th>
            <th>Tipo</th>
            <th>Descrição</th>
            <th className="categories-actions-column">
              Ações
            </th>
          </tr>
        </thead>

        <tbody>
          {categoriasFiltradas.map((categoria) => (
            <tr key={categoria.id}>
              <td>
                <div className="category-name-cell">
                  <span
                    className={`category-row-icon ${
                      categoria.tipo === "RECEITA"
                        ? "category-row-icon-income"
                        : "category-row-icon-expense"
                    }`}
                  >
                    <Tag size={17} strokeWidth={1.9} />
                  </span>

                  <div className="category-name-info">
                    <strong>{categoria.nome}</strong>
                    <small>
                      Categoria #{categoria.id}
                    </small>
                  </div>
                </div>
              </td>

              <td>
                <span
                  className={`category-badge ${
                    categoria.tipo === "RECEITA"
                      ? "category-badge-income"
                      : "category-badge-expense"
                  }`}
                >
                  {categoria.tipo === "RECEITA" ? (
                    <TrendingUp size={14} strokeWidth={2} />
                  ) : (
                    <TrendingDown size={14} strokeWidth={2} />
                  )}

                  {categoria.tipo === "RECEITA"
                    ? "Receita"
                    : "Despesa"}
                </span>
              </td>

              <td className="category-description-cell">
                {categoria.descricao || "Sem descrição"}
              </td>

              <td>
                <div className="category-actions">
                  <button
                    type="button"
                    className="category-action-button category-edit-button"
                    onClick={() =>
                      abrirFormularioEdicao(categoria)
                    }
                    aria-label={`Editar ${categoria.nome}`}
                    title="Editar categoria"
                  >
                    <Pencil size={16} strokeWidth={1.9} />
                  </button>

                  <button
                    type="button"
                    className="category-action-button category-delete-button"
                    onClick={() =>
                      solicitarExclusao(categoria)
                    }
                    aria-label={`Excluir ${categoria.nome}`}
                    title="Excluir categoria"
                  >
                    <Trash2 size={16} strokeWidth={1.9} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="categories-table-footer">
        <span>
          Exibindo <strong>{categoriasFiltradas.length}</strong> de{" "}
          <strong>{categorias.length}</strong>{" "}
          {categorias.length === 1 ? "categoria" : "categorias"}
        </span>
      </div>
    </div>
  )}
</section>
    </div>
  );
}

export default Categorias;