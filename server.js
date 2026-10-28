const express = require("express");
const path = require("path");
const db = require("./database/database");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/produtos", (req, res) => {
  const termo = String(req.query.busca || "").trim();
  const produtos = termo
    ? db.prepare(`
        SELECT * FROM produtos
        WHERE nome LIKE ? OR codigo LIKE ? OR categoria LIKE ?
        ORDER BY nome
      `).all(`%${termo}%`, `%${termo}%`, `%${termo}%`)
    : db.prepare("SELECT * FROM produtos ORDER BY nome").all();

  res.json(produtos);
});

app.post("/api/produtos", (req, res) => {
  const { codigo, nome, categoria, quantidade, minimo } = req.body;
  if (!codigo || !nome || quantidade === undefined || minimo === undefined) {
    return res.status(400).json({ erro: "Preencha código, nome, quantidade e estoque mínimo." });
  }

  const qtd = Number(quantidade);
  const min = Number(minimo);
  if (!Number.isInteger(qtd) || qtd < 0 || !Number.isInteger(min) || min < 0) {
    return res.status(400).json({ erro: "Quantidade e estoque mínimo devem ser números inteiros iguais ou maiores que zero." });
  }

  try {
    const resultado = db.prepare(`
      INSERT INTO produtos (codigo, nome, categoria, quantidade, minimo)
      VALUES (?, ?, ?, ?, ?)
    `).run(String(codigo).trim(), String(nome).trim(), String(categoria || "").trim(), qtd, min);

    const produto = db.prepare("SELECT * FROM produtos WHERE id = ?").get(resultado.lastInsertRowid);
    res.status(201).json(produto);
  } catch (erro) {
    if (erro.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({ erro: "Já existe um produto com esse código." });
    }
    console.error(erro);
    res.status(500).json({ erro: "Não foi possível cadastrar o produto." });
  }
});

app.put("/api/produtos/:id", (req, res) => {
  const id = Number(req.params.id);
  const { codigo, nome, categoria, quantidade, minimo } = req.body;
  const qtd = Number(quantidade);
  const min = Number(minimo);

  if (!codigo || !nome || !Number.isInteger(qtd) || qtd < 0 || !Number.isInteger(min) || min < 0) {
    return res.status(400).json({ erro: "Confira os campos e informe quantidades inteiras iguais ou maiores que zero." });
  }

  try {
    const resultado = db.prepare(`
      UPDATE produtos
      SET codigo = ?, nome = ?, categoria = ?, quantidade = ?, minimo = ?
      WHERE id = ?
    `).run(String(codigo).trim(), String(nome).trim(), String(categoria || "").trim(), qtd, min, id);

    if (resultado.changes === 0) return res.status(404).json({ erro: "Produto não encontrado." });
    res.json(db.prepare("SELECT * FROM produtos WHERE id = ?").get(id));
  } catch (erro) {
    if (erro.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({ erro: "Já existe outro produto com esse código." });
    }
    console.error(erro);
    res.status(500).json({ erro: "Não foi possível atualizar o produto." });
  }
});

app.delete("/api/produtos/:id", (req, res) => {
  const id = Number(req.params.id);
  const resultado = db.prepare("DELETE FROM produtos WHERE id = ?").run(id);
  if (resultado.changes === 0) return res.status(404).json({ erro: "Produto não encontrado." });
  res.status(204).end();
});

app.post("/api/produtos/:id/movimentacoes", (req, res) => {
  const id = Number(req.params.id);
  const { tipo, quantidade, observacao } = req.body;
  const qtd = Number(quantidade);

  if (!["entrada", "saida"].includes(tipo) || !Number.isInteger(qtd) || qtd <= 0) {
    return res.status(400).json({ erro: "Escolha entrada ou saída e informe uma quantidade inteira maior que zero." });
  }

  const movimentar = db.transaction(() => {
    const produto = db.prepare("SELECT * FROM produtos WHERE id = ?").get(id);
    if (!produto) throw new Error("PRODUTO_NAO_ENCONTRADO");

    if (tipo === "saida" && produto.quantidade < qtd) {
      throw new Error("ESTOQUE_INSUFICIENTE");
    }

    const novaQuantidade = tipo === "entrada"
      ? produto.quantidade + qtd
      : produto.quantidade - qtd;

    db.prepare("UPDATE produtos SET quantidade = ? WHERE id = ?").run(novaQuantidade, id);
    db.prepare(`
      INSERT INTO movimentacoes (produto_id, tipo, quantidade, observacao)
      VALUES (?, ?, ?, ?)
    `).run(id, tipo, qtd, String(observacao || "").trim());

    return db.prepare("SELECT * FROM produtos WHERE id = ?").get(id);
  });

  try {
    res.json(movimentar());
  } catch (erro) {
    if (erro.message === "PRODUTO_NAO_ENCONTRADO") return res.status(404).json({ erro: "Produto não encontrado." });
    if (erro.message === "ESTOQUE_INSUFICIENTE") return res.status(400).json({ erro: "Não há quantidade suficiente para essa saída." });
    console.error(erro);
    res.status(500).json({ erro: "Não foi possível registrar a movimentação." });
  }
});

app.get("/api/movimentacoes", (req, res) => {
  const movimentacoes = db.prepare(`
    SELECT movimentacoes.id, movimentacoes.tipo, movimentacoes.quantidade,
           movimentacoes.observacao, movimentacoes.criada_em,
           produtos.nome AS produto_nome, produtos.codigo AS produto_codigo
    FROM movimentacoes
    JOIN produtos ON produtos.id = movimentacoes.produto_id
    ORDER BY movimentacoes.id DESC
    LIMIT 100
  `).all();
  res.json(movimentacoes);
});

app.listen(PORT, () => {
  console.log(`Estoque Fácil disponível em http://localhost:${PORT}`);
});
