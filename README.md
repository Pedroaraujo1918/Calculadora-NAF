# Calculadora Tributária NAF

Aplicação React para estimar e comparar a carga tributária mensal de Pessoa Física e Pessoa Jurídica. Inclui as profissões psicólogo, arquiteto, advogado, médico e dentista; para médico e dentista, aplica o Fator R e indica o Anexo III ou V.

## Requisitos

- Node.js 24 ou superior (usa o módulo nativo `node:sqlite`)
- npm

## Como iniciar

1. No terminal, entre na pasta do projeto.
2. Execute `npm install`.
3. Em um terminal, execute `npm start` para iniciar a API e o banco SQLite em `data/calculadora.db`.
4. Em outro terminal, execute `npm run dev` e abra o endereço mostrado pelo Vite (normalmente `http://localhost:5173`).

## Configuração opcional de e-mail

Crie um arquivo `.env` na raiz, com `EMAIL_USER`, `EMAIL_PASS`, `NAF_EMAIL` e, opcionalmente, `JWT_SECRET`. Sem essas variáveis o formulário de contato informa claramente que o envio não está configurado; os cálculos, histórico e exportações continuam funcionando.

## Funcionalidades

- Rotas: calculadora, comparativo, histórico, FAQ, sobre/contato e página 404.
- Memória de cálculo PF e PJ, gráfico de barras e PDF do comparativo.
- Histórico persistido em SQLite e exportação em CSV.
- Tema claro/escuro persistido no navegador.
- Formulários com rótulos, foco visível, mensagens anunciadas e layout responsivo.

Os resultados são estimativas e não substituem a orientação de um contador.
