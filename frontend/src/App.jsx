import { useState } from "react";
import "./App.css";

function App() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [usuario, setUsuario] = useState(null);
  const [telaCadastro, setTelaCadastro] = useState(false);
  const [nome, setNome] = useState("");
  const [nomeEdicao, setNomeEdicao] = useState("");
  const [emailEdicao, setEmailEdicao] = useState("");
  const [mensagem, setMensagem] = useState("");

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
      const resposta = await fetch(
        "http://localhost:3000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email,
            senha
          })
        }
      );

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
              Authorization: `Bearer ${token}`
            }
          }
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
      const resposta = await fetch(
        "http://localhost:3000/api/usuarios",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            nome,
            email,
            senha
          })
        }
      );

      const dados = await resposta.json();

      if (resposta.ok) {
        console.log("Usuário cadastrado com sucesso!");

        setNome("");
        setEmail("");
        setSenha("");

        setMensagem(
          "Usuário cadastrado com sucesso! Faça o login."
        );

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
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            nome: nomeEdicao,
            email: emailEdicao
          })
        }
      );

      const dados = await resposta.json();

      if (resposta.ok) {
        console.log("Perfil atualizado com sucesso!");

        setUsuario({
          ...usuario,
          nome: nomeEdicao,
          email: emailEdicao
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
      "Tem certeza que deseja excluir sua conta?"
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
            Authorization: `Bearer ${token}`
          }
        }
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

  function handleLogout() {
    localStorage.removeItem("token");

    setUsuario(null);
    setEmail("");
    setSenha("");
    setNomeEdicao("");
    setEmailEdicao("");
    setMensagem("");
  }

  return (
    <>
      {usuario ? (
        <div className="profile-page">
          <aside className="sidebar">
            <div className="sidebar-logo">
              Fin<span>Control</span>
            </div>

            <nav className="sidebar-nav">
              <button
                type="button"
                className="sidebar-item sidebar-item-disabled"
              >
                <span className="sidebar-icon">⌂</span>
                Dashboard
              </button>

              <button
                type="button"
                className="sidebar-item sidebar-item-disabled"
              >
                <span className="sidebar-icon">↑</span>
                Receitas
              </button>

              <button
                type="button"
                className="sidebar-item sidebar-item-disabled"
              >
                <span className="sidebar-icon">↓</span>
                Despesas
              </button>

              <button
                type="button"
                className="sidebar-item sidebar-item-disabled"
              >
                <span className="sidebar-icon">□</span>
                Categorias
              </button>

              <button
                type="button"
                className="sidebar-item sidebar-item-disabled"
              >
                <span className="sidebar-icon">◎</span>
                Metas Financeiras
              </button>

              <button
                type="button"
                className="sidebar-item sidebar-item-disabled"
              >
                <span className="sidebar-icon">▥</span>
                Relatórios
              </button>

              <button
                type="button"
                className="sidebar-item sidebar-item-active"
              >
                <span className="sidebar-icon">○</span>
                Perfil
              </button>
            </nav>

            <button
              type="button"
              className="sidebar-item sidebar-logout"
              onClick={handleLogout}
            >
              <span className="sidebar-icon">↪</span>
              Sair
            </button>
          </aside>

          <main className="profile-main">
            <header className="profile-topbar">
              <button
                type="button"
                className="menu-button"
                aria-label="Menu"
              >
                ☰
              </button>

              <div className="topbar-user">
                <div className="topbar-avatar">
                  {usuario.nome
                    ? usuario.nome.charAt(0).toUpperCase()
                    : "U"}
                </div>

                <span>
                  Olá, {usuario.nome.split(" ")[0]}!
                </span>
              </div>
            </header>

            <section className="profile-content">
              <div className="profile-heading">
                <h1>Meu Perfil</h1>

                <p>
                  Gerencie suas informações pessoais e dados da conta.
                </p>
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

                    <p>{usuario.email}</p>
                  </div>
                </div>

                <div className="profile-summary-divider" />

                <div className="profile-date">
                  <span className="summary-icon">▣</span>

                  <p>Data de Cadastro</p>

                  <strong>
                    {formatarData(usuario.created_at)}
                  </strong>
                </div>
              </div>

              <div className="profile-grid">
                <section className="profile-card">
                  <div className="profile-card-title">
                    <span className="card-title-icon">○</span>

                    <h2>Informações Pessoais</h2>
                  </div>

                  <form
                    onSubmit={handleAtualizarPerfil}
                    className="profile-form"
                  >
                    <div className="profile-form-grid">
                      <div className="form-group">
                        <label htmlFor="nomeEdicao">
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
                        <label htmlFor="emailEdicao">
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
                      <p className="profile-message">
                        {mensagem}
                      </p>
                    )}

                    <div className="profile-form-actions">
                      <button
                        type="submit"
                        className="save-profile-button"
                      >
                        Salvar Alterações
                      </button>
                    </div>
                  </form>
                </section>

                <section className="account-card">
                  <div className="profile-card-title">
                    <span className="danger-title-icon">
                      !
                    </span>

                    <h2>Conta</h2>
                  </div>

                  <p className="account-text">
                    Você pode excluir permanentemente sua conta
                    e seus dados do FinControl.
                  </p>

                  <button
                    type="button"
                    className="delete-account-button"
                    onClick={handleExcluirConta}
                  >
                    Excluir conta
                  </button>
                </section>
              </div>
            </section>
          </main>
        </div>
      ) : telaCadastro ? (
        <div className="auth-page">
          <div className="auth-wrapper">
            <div className="auth-brand-panel">
              <div>
                <h1 className="brand-logo">
                  FinControl
                </h1>

                <h2 className="brand-title">
                  Comece agora sua jornada.
                </h2>

                <p className="brand-text">
                  Crie sua conta e tenha mais controle
                  sobre suas finanças de forma simples
                  e segura.
                </p>
              </div>

              <p className="brand-footer">
                Planejamento hoje, resultados amanhã.
              </p>
            </div>

            <div className="auth-form-panel">
              <div className="auth-form-content">
                <h2 className="auth-title">
                  Criar sua conta
                </h2>

                <p className="auth-subtitle">
                  Preencha os dados abaixo para se cadastrar.
                </p>

                <form onSubmit={handleCadastro}>
                  <div className="form-group">
                    <label htmlFor="nome">
                      Nome
                    </label>

                    <input
                      type="text"
                      id="nome"
                      value={nome}
                      onChange={(event) =>
                        setNome(event.target.value)
                      }
                      placeholder="Digite seu nome"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="emailCadastro">
                      E-mail
                    </label>

                    <input
                      type="email"
                      id="emailCadastro"
                      value={email}
                      onChange={(event) =>
                        setEmail(event.target.value)
                      }
                      placeholder="Digite seu e-mail"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="senhaCadastro">
                      Senha
                    </label>

                    <input
                      type="password"
                      id="senhaCadastro"
                      value={senha}
                      onChange={(event) =>
                        setSenha(event.target.value)
                      }
                      placeholder="Digite sua senha"
                    />
                  </div>

                  <button
                    type="submit"
                    className="primary-button"
                  >
                    Cadastrar
                  </button>
                </form>

                {mensagem && (
                  <p className="message">
                    {mensagem}
                  </p>
                )}

                <div className="auth-switch">
                  <p>
                    Já possui uma conta?
                  </p>

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
                <h1 className="brand-logo">
                  FinControl
                </h1>

                <h2 className="brand-title">
                  Mais controle para suas finanças.
                </h2>

                <p className="brand-text">
                  Organize, acompanhe e tome melhores
                  decisões para sua vida financeira.
                </p>
              </div>

              <p className="brand-footer">
                Planejamento hoje, resultados amanhã.
              </p>
            </div>

            <div className="auth-form-panel">
              <div className="auth-form-content">
                <h2 className="auth-title">
                  Bem-vindo(a)!
                </h2>

                <p className="auth-subtitle">
                  Faça seu login para acessar o FinControl.
                </p>

                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="email">
                      E-mail
                    </label>

                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(event.target.value)
                      }
                      placeholder="Digite seu e-mail"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="senha">
                      Senha
                    </label>

                    <input
                      type="password"
                      id="senha"
                      value={senha}
                      onChange={(event) =>
                        setSenha(event.target.value)
                      }
                      placeholder="Digite sua senha"
                    />
                  </div>

                  <button
                    type="submit"
                    className="primary-button"
                  >
                    Entrar
                  </button>
                </form>

                {mensagem && (
                  <p className="message">
                    {mensagem}
                  </p>
                )}

                <div className="auth-switch">
                  <p>
                    Não possui uma conta?
                  </p>

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