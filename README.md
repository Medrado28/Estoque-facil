# Estoque Fácil

Sistema web acadêmico para controle de produtos, quantidades e movimentações de estoque, desenvolvido para a disciplina de Desenvolvimento Web.

## Funcionalidades

- Cadastro de produtos com código único.
- Listagem e pesquisa por nome, código ou categoria.
- Edição e exclusão de produtos.
- Registro de entradas e saídas de estoque.
- Bloqueio de saídas maiores que a quantidade disponível.
- Alerta visual de estoque baixo.
- Histórico das últimas movimentações.
- Armazenamento dos dados em banco de dados SQLite.

## Tecnologias utilizadas

- **HTML5:** estrutura das páginas.
- **CSS3:** aparência e organização visual do sistema.
- **JavaScript:** interações e funcionalidades da interface.
- **Node.js:** execução do JavaScript no servidor.
- **Express.js:** criação do servidor e da API.
- **SQLite:** armazenamento dos dados.
- **Git e GitHub:** controle de versão e hospedagem do código.
- **Visual Studio Code:** editor de código.

## Requisitos

Instale uma versão LTS do Node.js pelo site oficial: https://nodejs.org/

## Como executar

1. Abra a pasta `estoque-facil` no Visual Studio Code.
2. Abra **Terminal > New Terminal**.
3. Execute o comando:

```bash
npm install
```

4. Quando a instalação terminar, execute:

```bash
npm start
```

5. Abra o Google Chrome e acesse: http://localhost:3000

Para parar o servidor, volte ao terminal e pressione `Control + C`.

## Banco de dados

Na primeira execução, o sistema deve criar automaticamente o banco de dados SQLite e as tabelas necessárias, conforme a implementação do projeto.

## Testes manuais sugeridos

1. Cadastre um produto com código `MAT-001`, nome `Papel A4`, quantidade `10` e estoque mínimo `3`.
2. Confira se o produto aparece na tabela.
3. Registre uma entrada de `5` unidades e confira se a quantidade passa para `15`.
4. Registre uma saída de `4` unidades e confira se a quantidade passa para `11`.
5. Tente registrar uma saída maior que o estoque disponível.
6. Pesquise o produto pelo nome ou código.
7. Atualize a página e confira se os dados continuam salvos.
8. Tente cadastrar outro produto com o mesmo código e confira se o sistema impede a duplicação.

## Observações
Este projeto é uma versão inicial para fins acadêmicos. Antes de ser utilizado por uma empresa, precisará de medidas adicionais de segurança, como autenticação, controle de acesso, cópias de segurança e auditoria.
=======
Este projeto é uma versão inicial para fins acadêmicos. Antes de uso real por uma empresa, seriam necessários autenticação, autorização de usuários, cópias de segurança, auditoria e outras medidas de segurança.

# Estoque-facil
Projeto de sistema de controle de estoque desenvolvido para a disciplina de Desenvolvimento Web.