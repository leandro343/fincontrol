import { useState } from "react";

function App() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [usuario, setUsuario] = useState(null);
  const [telaCadastro, setTelaCadastro] = useState(false);
  const [nome, setNome] = useState("");
  const [nomeEdicao, setNomeEdicao] = useState("");
  const [emailEdicao, setEmailEdicao] = useState("");
  const [mensagem, setMensagem] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setMensagem("");

    try {
      const resposta = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          senha
        })
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
      const resposta = await fetch("http://localhost:3000/api/usuarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nome,
          email,
          senha
        })
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
        <div>
          <h1>FinControl</h1>

          <h2>Meu Perfil</h2>

          <form onSubmit={handleAtualizarPerfil}>
            <div>
              <label htmlFor="nomeEdicao">Nome</label>
              <br />

              <input
                type="text"
                id="nomeEdicao"
                value={nomeEdicao}
                onChange={(event) => setNomeEdicao(event.target.value)}
              />
            </div>

            <br />

            <div>
              <label htmlFor="emailEdicao">E-mail</label>
              <br />

              <input
                type="email"
                id="emailEdicao"
                value={emailEdicao}
                onChange={(event) => setEmailEdicao(event.target.value)}
              />
            </div>

            <br />

            <button type="submit">
              Salvar alterações
            </button>
          </form>

          {mensagem && (
            <p>{mensagem}</p>
          )}

          <br />

          <button onClick={handleLogout}>
            Sair
          </button>

          <br />
          <br />

          <button onClick={handleExcluirConta}>
            Excluir conta
          </button>
        </div>
      ) : telaCadastro ? (
        <div>
          <h1>FinControl</h1>

          <h2>Cadastro</h2>

          <form onSubmit={handleCadastro}>
            <div>
              <label htmlFor="nome">Nome</label>
              <br />

              <input
                type="text"
                id="nome"
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                placeholder="Digite seu nome"
              />
            </div>

            <br />

            <div>
              <label htmlFor="emailCadastro">E-mail</label>
              <br />

              <input
                type="email"
                id="emailCadastro"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Digite seu e-mail"
              />
            </div>

            <br />

            <div>
              <label htmlFor="senhaCadastro">Senha</label>
              <br />

              <input
                type="password"
                id="senhaCadastro"
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                placeholder="Digite sua senha"
              />
            </div>

            <br />

            <button type="submit">
              Cadastrar
            </button>
          </form>

          {mensagem && (
            <p>{mensagem}</p>
          )}

          <br />

          <button
            onClick={() => {
              setTelaCadastro(false);
              setMensagem("");
            }}
          >
            Voltar para Login
          </button>
        </div>
      ) : (
        <div>
          <h1>FinControl</h1>

          <h2>Login</h2>

          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email">E-mail</label>
              <br />

              <input
                type="email"
                id="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Digite seu e-mail"
              />
            </div>

            <br />

            <div>
              <label htmlFor="senha">Senha</label>
              <br />

              <input
                type="password"
                id="senha"
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                placeholder="Digite sua senha"
              />
            </div>

            <br />

            <button type="submit">
              Entrar
            </button>
          </form>

          {mensagem && (
            <p>{mensagem}</p>
          )}

          <p>Não possui uma conta?</p>

          <button
            onClick={() => {
              setTelaCadastro(true);
              setMensagem("");
            }}
          >
            Criar conta
          </button>
        </div>
      )}
    </>
  );
}

export default App;