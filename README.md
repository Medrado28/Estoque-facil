# Estoque Fácil

Sistema web acadêmico para controle de produtos, quantidades e movimentações de estoque.

## Funcionalidades

- Cadastro de produtos com código único.
- Listagem e pesquisa por nome, código ou categoria.
- Edição e exclusão de produtos.
- Registro de entradas e saídas.
- Bloqueio de saídas maiores que a quantidade disponível.
- Alerta visual de estoque baixo.
- Histórico das últimas movimentações.
- Persistência dos dados em banco SQLite.

## Tecnologias

- HTML, CSS e JavaScript no frontend.
- Node.js e Express no backend/API.
- SQLite com `better-sqlite3`.
- Git e GitHub para versionamento.

## Requisitos

Instale uma versão LTS atual do Node.js: https://nodejs.org/

## Como executar

1. Abra a pasta `estoque-facil` no Visual Studio Code.
2. No VS Code, abra **Terminal > New Terminal** (Terminal > Novo Terminal).
3. Execute:

   ```bash
   npm install
   ```

4. Depois que a instalação terminar, execute:

   ```bash
   npm start
   ```

5. Abra no Google Chrome: http://localhost:3000

Para parar o servidor, volte ao terminal e pressione `Control + C`.

## Banco de dados

Na primeira execução, o sistema cria automaticamente o arquivo `database/estoque.db` e as tabelas `produtos` e `movimentacoes`.

## Testes manuais sugeridos

1. Cadastre um produto com código `MAT-001`, nome `Papel A4`, quantidade `10` e mínimo `3`.
2. Confira se aparece na tabela.
3. Registre uma entrada de `5` unidades; a quantidade deve passar para `15`.
4. Registre uma saída de `4` unidades; a quantidade deve passar para `11`.
5. Tente registrar uma saída maior que o estoque; o sistema deve impedir.
6. Pesquise o produto pelo nome ou código.
7. Atualize a página e confirme que os dados continuam salvos.
8. Cadastre outro produto com o mesmo código; o sistema deve rejeitar o duplicado.

## Observações

Este projeto é uma versão inicial para fins acadêmicos. Antes de uso real por uma empresa, seriam necessários autenticação, autorização de usuários, cópias de segurança, auditoria e outras medidas de segurança.
