const modal = document.getElementById("meuModal");
const btn = document.getElementById("abrirModal");
const span = document.querySelector(".close");
const nome = document.getElementById("nome");
const descricao = document.getElementById("descricao");
const hexadecimalColor = document.getElementById("hexadecimalColor");

getBoards();

btn.onclick = () => { modal.style.display = "block"; };
span.onclick = () => { modal.style.display = "none"; };
window.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };

function numeroAleatorio() {
  return Math.floor(Math.random() * 6000) + 1;
}

function numeroAleatorioLongo() {
  return Math.floor(Math.random() * 1000000000000000) + 1;
}

async function criarBoard() {
  const campos = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      Id: numeroAleatorio(),
      Name: nome.value,
      Description: descricao.value,
      HexadecimalColor: hexadecimalColor.value
    })
  };
  try {
    const resp = await fetch("https://personal-ga2xwx9j.outsystemscloud.com/Trellospl/rest/Trello/CreateOrUpdateBoard", campos);
    if (!resp.ok) throw new Error(`Erro ${resp.status}`);
    alert("Board criado com sucesso!");
    modal.style.display = "none";
    nome.value = ""; descricao.value = ""; hexadecimalColor.value = "";
    getBoards();
  } catch (e) {
    console.error(e);
    alert("Erro ao criar o board");
  }
}

async function getBoards() {
  try {
    const resp = await fetch("https://personal-ga2xwx9j.outsystemscloud.com/Trellospl/rest/Trello/GetBoards");
    if (!resp.ok) throw new Error(`Erro ${resp.status}`);
    const data = await resp.json();
    exibirBoards(data);
  } catch (e) {
    console.error(e);
    alert("Erro ao obter boards");
  }
}

function exibirBoards(boards) {
  const container = document.getElementById("listaBoards");
  container.innerHTML = "";
  boards.forEach(b => {
    const div = document.createElement("div");
    div.style = "background:" + (b.HexadecimalColor || "#ccc") + ";padding:10px;margin:10px;border-radius:8px;cursor:pointer";
    div.innerHTML = `<h3>${b.Name}</h3><p>${b.Description}</p>`;
    div.onclick = () => abrirBoardCompleto(b.Id);
    container.appendChild(div);
  });
}

async function abrirBoardCompleto(boardId) {
  try {
    const resp = await fetch(`https://personal-ga2xwx9j.outsystemscloud.com/Trellospl/rest/Trello/GetCompleteBoard?BoardId=${boardId}`);
    if (!resp.ok) throw new Error(`Erro ${resp.status}`);
    const data = await resp.json();
    const board = data.Board;
    const columns = data.ColumnStrs;

    document.getElementById("listaBoards").style.display = "none";
    const cont = document.getElementById("boardAberto");
    cont.innerHTML = `
      <div style="background:${board.HexadecimalColor || '#fff'};padding:20px;border-radius:10px;">
        <h2>${board.Name}</h2>
        <p>${board.Description}</p>
        <button onclick="voltarParaLista()">Voltar</button>
        <div id="colunaFormContainer" style="margin-top:10px;"></div>
        <div id="colunasContainer" style="display:flex;gap:10px;flex-wrap:wrap;margin-top:10px;"></div>
      </div>
    `;
    cont.style.display = "block";

    const form = document.getElementById("colunaFormContainer");
    const input = document.createElement("input");
    input.placeholder = "Título da nova coluna";
    const btn = document.createElement("button");
    btn.innerText = "Criar Coluna";
    btn.onclick = () => {
      if (input.value.trim()) {
        criarColuna(board.Id, input.value.trim());
        input.value = "";
      } else alert("Digite o título da coluna");
    };
    form.appendChild(input);
    form.appendChild(btn);

    columns.forEach(c => exibirColunaCompleta(c));
  } catch (e) {
    console.error(e);
    alert("Erro ao abrir o board");
  }
}

function voltarParaLista() {
  document.getElementById("boardAberto").style.display = "none";
  document.getElementById("listaBoards").style.display = "block";
}

async function criarColuna(boardId, titulo) {
  const campos = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      Id: numeroAleatorioLongo(),
      BoardId: boardId,
      Title: titulo
    })
  };
  try {
    const resp = await fetch("https://personal-ga2xwx9j.outsystemscloud.com/Trellospl/rest/Trello/CreateOrUpdateColumn", campos);
    if (!resp.ok) throw new Error(`Erro ${resp.status}`);
    const data = await resp.json();
    alert("Coluna criada!");
    exibirColunaCompleta({ Column: data, Tasks: [] });
  } catch (e) {
    console.error(e);
    alert("Erro ao criar coluna");
  }
}

async function criarTask(colunaId, title, desc) {
  const campos = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      Id: numeroAleatorioLongo(),
      ColumnId: colunaId,
      Title: title,
      Description: desc
    })
  };
  try {
    const resp = await fetch("https://personal-ga2xwx9j.outsystemscloud.com/Trellospl/rest/Trello/CreateOrUpdateTask", campos);
    if (!resp.ok) throw new Error(`Erro ${resp.status}`);
    const data = await resp.json();
    alert("Task criada!");
    exibirTaskNaColuna(colunaId, data);
  } catch (e) {
    console.error(e);
    alert("Erro ao criar task");
  }
}

async function deletarTask(taskId, taskDiv) {
  try {
    const resp = await fetch(
      `https://personal-ga2xwx9j.outsystemscloud.com/Trellospl/rest/Trello/DeleteTask?TaskId=${taskId}`,
      { method: "DELETE" }
    );
    if (!resp.ok) throw new Error(`Erro ${resp.status}`);
    alert("Task deletada com sucesso!");
    taskDiv.remove();
  } catch (e) {
    console.error(e);
    alert("Erro ao deletar task");
  }
}

function gerarHTMLTask(task) {
  const wrapper = document.createElement("div");
  wrapper.style = "background:#fff;padding:5px;margin:5px 0;border-radius:5px;position:relative;";
  
  wrapper.innerHTML = `
    <strong>${task.Title}</strong><br/>
    <small>${task.Description}</small>
    <button style="position:absolute; top:2px; right:2px;" title="Excluir">X</button>
  `;

  const btn = wrapper.querySelector("button");
  btn.onclick = () => {
    if (confirm("Tem certeza que deseja excluir esta task?")) {
      deletarTask(task.Id, wrapper);
    }
  };

  return wrapper;
}

function exibirTaskNaColuna(colunaId, task) {
  const coluna = document.querySelector(`[data-coluna-id='${colunaId}'] .tasks`);
  coluna.appendChild(gerarHTMLTask(task));
}

function exibirColunaCompleta(colStr) {
  const coluna = colStr.Column;
  const tasks = colStr.Tasks || [];
  const cont = document.getElementById("colunasContainer");

  const div = document.createElement("div");
  div.style = "background:#eee;padding:10px;border-radius:8px;width:200px;";
  div.dataset.colunaId = coluna.Id;

  div.innerHTML = `<h4>${coluna.Title}</h4><div class="tasks"></div>`;
  const taskContainer = div.querySelector(".tasks");
  tasks.forEach(t => {
    taskContainer.appendChild(gerarHTMLTask(t));
  });

  const inputTitle = document.createElement("input");
  inputTitle.placeholder = "Título";
  const inputDesc = document.createElement("input");
  inputDesc.placeholder = "Descrição";
  const btn = document.createElement("button");
  btn.innerText = "Criar Task";
  btn.onclick = () => {
    if (inputTitle.value.trim()) {
      criarTask(coluna.Id, inputTitle.value.trim(), inputDesc.value.trim());
      inputTitle.value = ""; inputDesc.value = "";
    } else alert("Informe o título da task");
  };

  div.appendChild(inputTitle);
  div.appendChild(inputDesc);
  div.appendChild(btn);

  cont.appendChild(div);
}