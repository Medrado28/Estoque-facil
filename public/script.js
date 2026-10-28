const formProduto = document.querySelector("#formProduto");
const listaProdutos = document.querySelector("#listaProdutos");
const listaMovimentacoes = document.querySelector("#listaMovimentacoes");
const mensagem = document.querySelector("#mensagem");
const busca = document.querySelector("#busca");
const dialogEdicao = document.querySelector("#dialogEdicao");

function escapar(valor) {
  return String(valor ?? "").replace(/[&<>"']/g, caractere => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[caractere]);
}

function mostrarMensagem(texto, tipo = "sucesso") {
  mensagem.textContent = texto;
  mensagem.className = `mensagem ${tipo}`;
}

async function requisicao(url, opcoes = {}) {
  const resposta = await fetch(url, {
    ...opcoes,
    headers: { "Content-Type": "application/json", ...(opcoes.headers || {}) }
  });
  if (!resposta.ok) {
    const dados = resposta.status === 204 ? {} : await resposta.json().catch(() => ({}));
    throw new Error(dados.erro || "Ocorreu um erro na solicitação.");
  }
  return resposta.status === 204 ? null : resposta.json();
}

async function carregarProdutos() {
  try {
    const termo = encodeURIComponent(busca.value.trim());
    const produtos = await requisicao(`/api/produtos?busca=${termo}`);
    desenharProdutos(produtos);
    atualizarResumo(produtos);
  } catch (erro) {
    listaProdutos.innerHTML = `<tr><td colspan="6" class="vazio">${escapar(erro.message)}</td></tr>`;
  }
}

function atualizarResumo(produtos) {
  document.querySelector("#totalProdutos").textContent = produtos.length;
  document.querySelector("#totalUnidades").textContent = produtos.reduce((soma, p) => soma + p.quantidade, 0);
  document.querySelector("#totalBaixo").textContent = produtos.filter(p => p.quantidade <= p.minimo).length;
}

function desenharProdutos(produtos) {
  if (!produtos.length) {
    listaProdutos.innerHTML = '<tr><td colspan="6" class="vazio">Nenhum produto encontrado. Cadastre o primeiro produto acima.</td></tr>';
    return;
  }

  listaProdutos.innerHTML = produtos.map(p => {
    const baixo = p.quantidade <= p.minimo;
    return `<tr>
      <td>${escapar(p.codigo)}</td>
      <td><strong>${escapar(p.nome)}</strong></td>
      <td>${escapar(p.categoria || "—")}</td>
      <td>${p.quantidade} <span class="texto-secundario">/ mín. ${p.minimo}</span></td>
      <td><span class="status ${baixo ? "baixo" : "ok"}">${baixo ? "Estoque baixo" : "Disponível"}</span></td>
      <td><div class="acoes">
        <button class="botao-pequeno" data-acao="entrada" data-id="${p.id}">+ Entrada</button>
        <button class="botao-pequeno" data-acao="saida" data-id="${p.id}">− Saída</button>
        <button class="botao-pequeno" data-acao="editar" data-id="${p.id}">Editar</button>
        <button class="botao-pequeno perigo" data-acao="excluir" data-id="${p.id}">Excluir</button>
      </div></td>
    </tr>`;
  }).join("");
}

async function carregarMovimentacoes() {
  try {
    const itens = await requisicao("/api/movimentacoes");
    if (!itens.length) {
      listaMovimentacoes.innerHTML = '<tr><td colspan="5" class="vazio">Nenhuma movimentação registrada.</td></tr>';
      return;
    }
    listaMovimentacoes.innerHTML = itens.map(m => {
      const data = new Date(m.criada_em.replace(" ", "T"));
      const dataFormatada = Number.isNaN(data.getTime()) ? m.criada_em : data.toLocaleString("pt-BR");
      return `<tr>
        <td>${escapar(dataFormatada)}</td>
        <td>${escapar(m.produto_nome)} (${escapar(m.produto_codigo)})</td>
        <td class="${m.tipo === "entrada" ? "tipo-entrada" : "tipo-saida"}">${m.tipo === "entrada" ? "Entrada" : "Saída"}</td>
        <td>${m.quantidade}</td>
        <td>${escapar(m.observacao || "—")}</td>
      </tr>`;
    }).join("");
  } catch (erro) {
    listaMovimentacoes.innerHTML = `<tr><td colspan="5" class="vazio">${escapar(erro.message)}</td></tr>`;
  }
}

async function atualizarTela() {
  await Promise.all([carregarProdutos(), carregarMovimentacoes()]);
}

formProduto.addEventListener("submit", async evento => {
  evento.preventDefault();
  const dados = Object.fromEntries(new FormData(formProduto).entries());
  dados.quantidade = Number(dados.quantidade);
  dados.minimo = Number(dados.minimo);
  try {
    await requisicao("/api/produtos", { method: "POST", body: JSON.stringify(dados) });
    formProduto.reset();
    document.querySelector("#quantidade").value = "0";
    document.querySelector("#minimo").value = "5";
    mostrarMensagem("Produto cadastrado com sucesso!");
    await atualizarTela();
  } catch (erro) {
    mostrarMensagem(erro.message, "erro");
  }
});

busca.addEventListener("input", carregarProdutos);

listaProdutos.addEventListener("click", async evento => {
  const botao = evento.target.closest("button[data-acao]");
  if (!botao) return;
  const id = Number(botao.dataset.id);
  const acao = botao.dataset.acao;

  try {
    if (acao === "entrada" || acao === "saida") {
      const quantidadeTexto = prompt(`Qual quantidade deseja registrar como ${acao}?`);
      if (quantidadeTexto === null) return;
      const quantidade = Number(quantidadeTexto);
      if (!Number.isInteger(quantidade) || quantidade <= 0) {
        mostrarMensagem("Digite um número inteiro maior que zero.", "erro");
        return;
      }
      const observacao = prompt("Observação (opcional):") || "";
      await requisicao(`/api/produtos/${id}/movimentacoes`, {
        method: "POST",
        body: JSON.stringify({ tipo: acao, quantidade, observacao })
      });
      mostrarMensagem(`${acao === "entrada" ? "Entrada" : "Saída"} registrada com sucesso.`);
      await atualizarTela();
    }

    if (acao === "editar") {
      const produtos = await requisicao("/api/produtos");
      const p = produtos.find(item => item.id === id);
      if (!p) throw new Error("Produto não encontrado.");
      document.querySelector("#edicaoId").value = p.id;
      document.querySelector("#edicaoCodigo").value = p.codigo;
      document.querySelector("#edicaoNome").value = p.nome;
      document.querySelector("#edicaoCategoria").value = p.categoria;
      document.querySelector("#edicaoQuantidade").value = p.quantidade;
      document.querySelector("#edicaoMinimo").value = p.minimo;
      dialogEdicao.showModal();
    }

    if (acao === "excluir") {
      if (!confirm("Tem certeza de que deseja excluir este produto? O histórico relacionado deixará de aparecer na lista.")) return;
      await requisicao(`/api/produtos/${id}`, { method: "DELETE" });
      mostrarMensagem("Produto excluído.");
      await atualizarTela();
    }
  } catch (erro) {
    mostrarMensagem(erro.message, "erro");
  }
});

document.querySelector("#formEdicao").addEventListener("submit", async evento => {
  evento.preventDefault();
  const id = Number(document.querySelector("#edicaoId").value);
  const dados = {
    codigo: document.querySelector("#edicaoCodigo").value.trim(),
    nome: document.querySelector("#edicaoNome").value.trim(),
    categoria: document.querySelector("#edicaoCategoria").value.trim(),
    quantidade: Number(document.querySelector("#edicaoQuantidade").value),
    minimo: Number(document.querySelector("#edicaoMinimo").value)
  };
  try {
    await requisicao(`/api/produtos/${id}`, { method: "PUT", body: JSON.stringify(dados) });
    dialogEdicao.close();
    mostrarMensagem("Produto atualizado com sucesso.");
    await atualizarTela();
  } catch (erro) {
    mostrarMensagem(erro.message, "erro");
  }
});

document.querySelector("#cancelarEdicao").addEventListener("click", () => dialogEdicao.close());

atualizarTela();
