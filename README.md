\# FinControl



O FinControl é uma aplicação web para gerenciamento financeiro pessoal, desenvolvida como Trabalho de Conclusão de Curso do curso de Análise e Desenvolvimento de Sistemas.



\## Tecnologias utilizadas



\- React

\- JavaScript

\- Node.js

\- Express

\- MySQL

\- Docker

\- Docker Compose



\## Execução do projeto



\### Pré-requisito



Para executar o sistema é necessário possuir o Docker instalado e em execução.



\### Iniciar a aplicação



Na pasta raiz do projeto execute:



```bash

docker compose up -d --build

```



Após a inicialização dos containers acesse a aplicação pelo navegador em:



http://localhost:5173



\## Encerrar a aplicação



Para encerrar os containers execute:



```bash

docker compose down

```



\## Serviços



\- Frontend: React - porta 5173

\- Backend: Node.js e Express - porta 3000

\- Banco de dados: MySQL - porta 3306



\## Sprint 1



Funcionalidades implementadas:



\- Cadastro de usuário

\- Login e autenticação

\- Consulta dos dados do usuário

\- Atualização do perfil

\- Exclusão da conta

\- Logout

\- Controle de acesso aos dados do usuário

\- Persistência dos dados em MySQL

\- Execução da aplicação utilizando Docker Compose



\## Autor



Leandro Alves da Silva

