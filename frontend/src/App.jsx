import { useState, useCallback } from "react";
import "./App.css";
import Categorias from "./pages/Categorias";
import Contas from "./pages/Contas";
import Movimentacoes from "./pages/Movimentacoes";
import Dashboard from "./pages/Dashboard";
import Relatorios from "./pages/Relatorios";
import Metas from "./pages/Metas";
import {
  LayoutDashboard,
  WalletCards,
  ArrowRightLeft,
  Tags,
  Target,
  ChartNoAxesCombined,
  UserRound,
  LogOut,
  Menu,
  CalendarDays,
  Info,
  CircleAlert,
  Mail,
  Save,
  Trash2,
} from "lucide-react";

function App() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [usuario, setUsuario] = useState(null);
  const [telaCadastro, setTelaCadastro] = useState(false);
  const [nome, setNome] = useState("");
  const [nomeEdicao, setNomeEdicao] = useState("");
  const [emailEdicao, setEmailEdicao] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [paginaAtual, setPaginaAtual] = useState("perfil");

  function formatarData(data) {
    if (!data) {
      return "-";
    }

    return new Date(data).toLocaleDateString("pt-BR");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setMensagem("");

    try {
      const resposta = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          senha,
        }),
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        localStorage.setItem("token", dados.token);

        console.log("Login realizado com sucesso!");

        const token = dados.token;

        const respostaPerfil = await fetch(
          `http://localhost:3000/api/usuarios/${dados.usuario.id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const perfil = await respostaPerfil.json();

        if (respostaPerfil.ok) {
          console.log("Perfil:", perfil);

          setUsuario(perfil);
          setNomeEdicao(perfil.nome);
          setEmailEdicao(perfil.email);
          setMensagem("");
        } else {
          setMensagem(perfil.mensagem);
        }
      } else {
        setMensagem(dados.mensagem);
      }
    } catch (error) {
      console.error("Erro ao realizar login:", error);

      setMensagem("Não foi possível conectar ao servidor.");
    }
  }

  async function handleCadastro(event) {
    event.preventDefault();

    setMensagem("");

    try {
      const resposta = await fetch("http://localhost:3000/api/usuarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome,
          email,
          senha,
        }),
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        console.log("Usuário cadastrado com sucesso!");

        setNome("");
        setEmail("");
        setSenha("");

        setMensagem("Usuário cadastrado com sucesso! Faça o login.");

        setTelaCadastro(false);
      } else {
        setMensagem(dados.mensagem);
      }
    } catch (error) {
      console.error("Erro ao cadastrar usuário:", error);

      setMensagem("Não foi possível realizar o cadastro.");
    }
  }

  async function handleAtualizarPerfil(event) {
    event.preventDefault();

    setMensagem("");

    try {
      const token = localStorage.getItem("token");

      const resposta = await fetch(
        `http://localhost:3000/api/usuarios/${usuario.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            nome: nomeEdicao,
            email: emailEdicao,
          }),
        },
      );

      const dados = await resposta.json();

      if (resposta.ok) {
        console.log("Perfil atualizado com sucesso!");

        setUsuario({
          ...usuario,
          nome: nomeEdicao,
          email: emailEdicao,
        });

        setMensagem("Perfil atualizado com sucesso!");
      } else {
        setMensagem(dados.mensagem);
      }
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);

      setMensagem("Não foi possível atualizar o perfil.");
    }
  }

  async function handleExcluirConta() {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir sua conta?",
    );

    if (!confirmar) {
      return;
    }

    setMensagem("");

    try {
      const token = localStorage.getItem("token");

      const resposta = await fetch(
        `http://localhost:3000/api/usuarios/${usuario.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const dados = await resposta.json();

      if (resposta.ok) {
        console.log("Conta excluída com sucesso!");

        localStorage.removeItem("token");

        setUsuario(null);
        setEmail("");
        setSenha("");
        setNome("");
        setNomeEdicao("");
        setEmailEdicao("");

        setMensagem("Conta excluída com sucesso.");
      } else {
        setMensagem(dados.mensagem);
      }
    } catch (error) {
      console.error("Erro ao excluir conta:", error);

      setMensagem("Não foi possível excluir a conta.");
    }
  }

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");

    setUsuario(null);
    setEmail("");
    setSenha("");
    setNomeEdicao("");
    setEmailEdicao("");
    setMensagem("");
  }, []);

  const handleSessaoExpirada = useCallback(() => {
    handleLogout();

    setMensagem(
      "Sua sessão expirou ou não é mais válida. Faça login novamente.",
    );
  }, [handleLogout]);

  return (
    <>
      {usuario ? (
        <div className="profile-page">
          <aside className="sidebar">
            <div className="sidebar-brand">
              <div className="sidebar-logo">
                <ChartNoAxesCombined
                  className="fc-logo-icone"
                  size={27}
                  strokeWidth={2.3}
                  aria-hidden="true"
                />

                <div className="fc-logo-nome">
                  Fin<span>Control</span>
                </div>
              </div>
            </div>
            <nav className="sidebar-nav">
              <div className="sidebar-section">
                <span className="sidebar-section-title">Visão Geral</span>

                <button
                  type="button"
                  className={`sidebar-item ${
                    paginaAtual === "dashboard" ? "sidebar-item-active" : ""
                  }`}
                  onClick={() => setPaginaAtual("dashboard")}
                >
                  <LayoutDashboard
                    className="sidebar-icon"
                    size={19}
                    strokeWidth={1.8}
                  />
                  <span>Dashboard</span>
                </button>
              </div>

              <div className="sidebar-section">
                <span className="sidebar-section-title">Finanças</span>
                <button
                  type="button"
                  className={`sidebar-item ${
                    paginaAtual === "categorias" ? "sidebar-item-active" : ""
                  }`}
                  onClick={() => setPaginaAtual("categorias")}
                >
                  <Tags className="sidebar-icon" size={19} strokeWidth={1.8} />
                  <span>Categorias</span>
                </button>
                <button
                  type="button"
                  className={`sidebar-item ${
                    paginaAtual === "contas" ? "sidebar-item-active" : ""
                  }`}
                  onClick={() => setPaginaAtual("contas")}
                >
                  <WalletCards
                    className="sidebar-icon"
                    size={19}
                    strokeWidth={1.8}
                  />
                  <span>Contas</span>
                </button>

                <button
                  type="button"
                  className={`sidebar-item ${
                    paginaAtual === "movimentacoes" ? "sidebar-item-active" : ""
                  }`}
                  onClick={() => setPaginaAtual("movimentacoes")}
                >
                  <ArrowRightLeft
                    className="sidebar-icon"
                    size={19}
                    strokeWidth={1.8}
                  />
                  <span>Movimentações</span>
                </button>

                <button
                  type="button"
                  className={`sidebar-item ${
                    paginaAtual === "metas" ? "sidebar-item-active" : ""
                  }`}
                  onClick={() => setPaginaAtual("metas")}
                >
                  <Target
                    className="sidebar-icon"
                    size={19}
                    strokeWidth={1.8}
                  />
                  <span>Metas Financeiras</span>
                </button>
              </div>

              <div className="sidebar-section">
                <span className="sidebar-section-title">Análises</span>

                <button
                  type="button"
                  className={`sidebar-item ${
                    paginaAtual === "relatorios" ? "sidebar-item-active" : ""
                  }`}
                  onClick={() => setPaginaAtual("relatorios")}
                >
                  <ChartNoAxesCombined
                    className="sidebar-icon"
                    size={19}
                    strokeWidth={1.8}
                  />
                  <span>Relatórios</span>
                </button>
              </div>
            </nav>

            <div className="sidebar-footer">
              <button
                type="button"
                className={`sidebar-item ${
                  paginaAtual === "perfil" ? "sidebar-item-active" : ""
                }`}
                onClick={() => setPaginaAtual("perfil")}
              >
                <UserRound
                  className="sidebar-icon"
                  size={19}
                  strokeWidth={1.8}
                />
                <span>Perfil</span>
              </button>

              <button
                type="button"
                className="sidebar-item sidebar-logout"
                onClick={handleLogout}
              >
                <LogOut className="sidebar-icon" size={19} strokeWidth={1.8} />
                <span>Sair</span>
              </button>
            </div>
          </aside>

          <main className="profile-main">
            <header className="profile-topbar">
              <div className="topbar-user">
                <div className="topbar-avatar">
                  {usuario.nome ? usuario.nome.charAt(0).toUpperCase() : "U"}
                </div>

                <span>Olá, {usuario.nome.split(" ")[0]}!</span>
              </div>
            </header>

            <section className="profile-content">
              {paginaAtual === "dashboard" ? (
                <Dashboard onSessaoExpirada={handleSessaoExpirada} />
              ) : paginaAtual === "relatorios" ? (
                <Relatorios />
              ) : paginaAtual === "categorias" ? (
                <Categorias />
              ) : paginaAtual === "contas" ? (
                <Contas />
              ) : paginaAtual === "movimentacoes" ? (
                <Movimentacoes />
              ) : paginaAtual === "metas" ? (
                <Metas onSessaoExpirada={handleSessaoExpirada} />
              ) : (
                <>
                  <div className="profile-heading profile-heading-identidade">
                    <span className="profile-titulo-icone" aria-hidden="true">
                      <UserRound size={24} strokeWidth={2} />
                    </span>

                    <div className="profile-heading-textos">
                      <h1>Meu Perfil</h1>
                      <p>
                        Gerencie suas informações pessoais e dados da conta.
                      </p>
                    </div>
                  </div>

                  <div className="profile-summary-card">
                    <div className="profile-user-summary">
                      <div className="profile-avatar">
                        {usuario.nome
                          ? usuario.nome.charAt(0).toUpperCase()
                          : "U"}
                      </div>

                      <div>
                        <h2>{usuario.nome}</h2>

                        <p className="profile-email-com-icone">
                          <Mail size={17} strokeWidth={2} aria-hidden="true" />
                          {usuario.email}
                        </p>
                      </div>
                    </div>

                    <div className="profile-summary-divider" />

                    <div className="profile-date">
                      <span className="summary-icon" aria-hidden="true">
                        <CalendarDays size={22} strokeWidth={2} />
                      </span>

                      <p>Data de Cadastro</p>

                      <strong>{formatarData(usuario.created_at)}</strong>
                    </div>
                  </div>

                  <div className="profile-grid">
                    <section className="profile-card">
                      <div className="profile-card-title">
                        <span className="card-title-icon" aria-hidden="true">
                          <Info size={20} strokeWidth={2} />
                        </span>

                        <div className="profile-card-title-textos">
                          <h2>Informações Pessoais</h2>
                          <p>Confira e atualize seus dados, se necessário.</p>
                        </div>
                      </div>

                      <form
                        onSubmit={handleAtualizarPerfil}
                        className="profile-form"
                      >
                        <div className="profile-form-grid">
                          <div className="form-group">
                            <label
                              htmlFor="nomeEdicao"
                              className="profile-label-com-icone"
                            >
                              <UserRound
                                size={17}
                                strokeWidth={2}
                                aria-hidden="true"
                              />
                              Nome Completo
                            </label>

                            <input
                              type="text"
                              id="nomeEdicao"
                              value={nomeEdicao}
                              onChange={(event) =>
                                setNomeEdicao(event.target.value)
                              }
                            />
                          </div>

                          <div className="form-group">
                            <label
                              htmlFor="emailEdicao"
                              className="profile-label-com-icone"
                            >
                              <Mail
                                size={17}
                                strokeWidth={2}
                                aria-hidden="true"
                              />
                              E-mail
                            </label>

                            <input
                              type="email"
                              id="emailEdicao"
                              value={emailEdicao}
                              onChange={(event) =>
                                setEmailEdicao(event.target.value)
                              }
                            />
                          </div>
                        </div>

                        {mensagem && (
                          <p className="profile-message">{mensagem}</p>
                        )}

                        <div className="profile-form-actions">
                          <button type="submit" className="save-profile-button">
                            <Save
                              size={17}
                              strokeWidth={2}
                              aria-hidden="true"
                            />
                            Salvar Alterações
                          </button>
                        </div>
                      </form>
                    </section>

                    <section className="account-card">
                      <div className="profile-card-title">
                        <span className="danger-title-icon" aria-hidden="true">
                          <CircleAlert size={20} strokeWidth={2} />
                        </span>

                        <h2>Conta</h2>
                      </div>

                      <p className="account-text">
                        Você pode excluir permanentemente sua conta e seus dados
                        do FinControl.
                      </p>

                      <button
                        type="button"
                        className="delete-account-button"
                        onClick={handleExcluirConta}
                      >
                        <Trash2 size={18} strokeWidth={2} aria-hidden="true" />
                        Excluir conta
                      </button>
                    </section>
                  </div>
                </>
              )}
            </section>
          </main>
        </div>
      ) : telaCadastro ? (
        <div className="auth-page">
          <div className="auth-wrapper">
            <div className="auth-brand-panel">
              <div>
                <h1 className="brand-logo brand-logo-com-icone">
                  <ChartNoAxesCombined
                    size={38}
                    strokeWidth={2.4}
                    aria-hidden="true"
                  />
                  <span>FinControl</span>
                </h1>

                <h2 className="brand-title">Comece agora sua jornada.</h2>

                <p className="brand-text">
                  Crie sua conta e tenha mais controle sobre suas finanças de
                  forma simples e segura.
                </p>
              </div>

              {/* Gráfico de crescimento financeiro */}
              <div className="auth-growth-chart" aria-hidden="true">
                <div className="auth-growth-bars">
                  <span />
                  <span />
                  <span />
                  <span />
                </div>

                <svg
                  className="auth-growth-arrow"
                  viewBox="0 0 360 180"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M 24 157 C 100 145, 155 115, 220 91 S 312 46, 330 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 310 27 L 332 20 L 328 43"
                    fill="none"
                    stroke="white"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <p className="brand-footer">
                Planejamento hoje, resultados amanhã.
              </p>
            </div>

            <div className="auth-form-panel">
              <div className="auth-form-content">
                <h2 className="auth-title">Criar sua conta</h2>

                <p className="auth-subtitle">
                  Preencha os dados abaixo para se cadastrar.
                </p>

                <form onSubmit={handleCadastro}>
                  <div className="form-group">
                    <label htmlFor="nome">Nome</label>

                    <input
                      type="text"
                      id="nome"
                      value={nome}
                      onChange={(event) => setNome(event.target.value)}
                      placeholder="Digite seu nome"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="emailCadastro">E-mail</label>

                    <input
                      type="email"
                      id="emailCadastro"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="Digite seu e-mail"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="senhaCadastro">Senha</label>

                    <input
                      type="password"
                      id="senhaCadastro"
                      value={senha}
                      onChange={(event) => setSenha(event.target.value)}
                      placeholder="Digite sua senha"
                    />
                  </div>

                  <button type="submit" className="primary-button">
                    Cadastrar
                  </button>
                </form>

                {mensagem && <p className="message">{mensagem}</p>}

                <div className="auth-switch">
                  <p>Já possui uma conta?</p>

                  <button
                    type="button"
                    className="link-button"
                    onClick={() => {
                      setTelaCadastro(false);
                      setMensagem("");
                    }}
                  >
                    Voltar ao login
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="auth-page">
          <div className="auth-wrapper">
            <div className="auth-brand-panel">
              <div>
                <h1 className="brand-logo brand-logo-com-icone">
                  <ChartNoAxesCombined
                    size={38}
                    strokeWidth={2.4}
                    aria-hidden="true"
                  />
                  <span>FinControl</span>
                </h1>

                <h2 className="brand-title">
                  Mais controle para suas finanças.
                </h2>

                <p className="brand-text">
                  Organize, acompanhe e tome melhores decisões para sua vida
                  financeira.
                </p>
              </div>

              {/* Gráfico de crescimento financeiro */}
              <div className="auth-growth-chart" aria-hidden="true">
                <div className="auth-growth-bars">
                  <span />
                  <span />
                  <span />
                  <span />
                </div>

                <svg
                  className="auth-growth-arrow"
                  viewBox="0 0 360 180"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M 24 157 C 100 145, 155 115, 220 91 S 312 46, 330 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 310 27 L 332 20 L 328 43"
                    fill="none"
                    stroke="white"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <p className="brand-footer">
                Planejamento hoje, resultados amanhã.
              </p>
            </div>

            <div className="auth-form-panel">
              <div className="auth-form-content">
                <h2 className="auth-title">Bem-vindo(a)!</h2>

                <p className="auth-subtitle">
                  Faça seu login para acessar o FinControl.
                </p>

                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="email">E-mail</label>

                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="Digite seu e-mail"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="senha">Senha</label>

                    <input
                      type="password"
                      id="senha"
                      value={senha}
                      onChange={(event) => setSenha(event.target.value)}
                      placeholder="Digite sua senha"
                    />
                  </div>

                  <button type="submit" className="primary-button">
                    Entrar
                  </button>
                </form>

                {mensagem && <p className="message">{mensagem}</p>}

                <div className="auth-switch">
                  <p>Não possui uma conta?</p>

                  <button
                    type="button"
                    className="link-button"
                    onClick={() => {
                      setTelaCadastro(true);
                      setMensagem("");
                    }}
                  >
                    Criar conta
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
