import { useState } from "react";

function App() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [usuario, setUsuario] = useState(null);
  const [telaCadastro, setTelaCadastro] = useState(false);
  const [nome, setNome] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

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
        console.log("Token armazenado:", dados.token);

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

        console.log("Perfil:", perfil);

        setUsuario(perfil);
      } else {
        console.log("Erro:", dados.mensagem);
      }

    } catch (error) {
      console.error("Erro ao realizar login:", error);
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    setUsuario(null);
    setEmail("");
    setSenha("");
  }

  return (
    <>
      {usuario ? (
        <div>
          <h1>FinControl</h1>
          <h2>Bem-vindo, {usuario.nome}</h2>
          <p>E-mail: {usuario.email}</p>

          <button onClick={handleLogout}>
            Sair
          </button>
        </div>
      ) : telaCadastro ? (
        <div>
          <h1>FinControl</h1>
          <h2>Cadastro</h2>

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

          <button>
            Cadastrar
          </button>

          <br />
          <br />

          <button onClick={() => setTelaCadastro(false)}>
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

          <p>Não possui uma conta?</p>

          <button onClick={() => setTelaCadastro(true)}>
            Criar conta
          </button>
        </div>
      )}
    </>
  );
}

export default App;