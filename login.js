const LS_USUARIOS = "missingmon_usuarios";
const LS_LOGADO   = "missingmon_logado";

function getUsuarios() {
    return JSON.parse(localStorage.getItem(LS_USUARIOS) || "{}");
}
function salvarUsuarios(d) { localStorage.setItem(LS_USUARIOS, JSON.stringify(d)); }
function getLogado()       { return localStorage.getItem(LS_LOGADO); }
function setLogado(u)      { u ? localStorage.setItem(LS_LOGADO, u) : localStorage.removeItem(LS_LOGADO); }

function atualizarHeader() {
    const u     = getLogado();
    const label = document.getElementById("navLoginLabel");
    if (u) {
        const dados = getUsuarios()[u];
        label.textContent = dados ? dados.nome.split(" ")[0] : u;
        label.style.color = "#e6a800";
    } else {
        label.textContent = "Login";
        label.style.color = "#9b6ec8";
    }
}

function abrirLogin() {
    document.getElementById("loginError").textContent = "";
    document.getElementById("inputUser").value = "";
    document.getElementById("overlayLogin").classList.add("active");
    document.body.style.overflow = "hidden";
}
function fecharLogin() {
    document.getElementById("overlayLogin").classList.remove("active");
    document.body.style.overflow = "";
}
function abrirRegister() {
    fecharLogin();
    document.getElementById("registerError").textContent = "";
    document.getElementById("regNome").value  = "";
    document.getElementById("regUser").value  = "";
    document.getElementById("overlayRegister").classList.add("active");
    document.body.style.overflow = "hidden";
}
function fecharRegister() {
    document.getElementById("overlayRegister").classList.remove("active");
    document.body.style.overflow = "";
}

function fazerLogin() {
    const user = document.getElementById("inputUser").value.trim().toLowerCase();
    const err  = document.getElementById("loginError");
    if (!user) { err.textContent = "Digite seu usuário."; return; }
    if (!getUsuarios()[user]) { err.textContent = "Usuário não encontrado."; return; }
    setLogado(user);
    atualizarHeader();
    fecharLogin();
    if (window.atualizarTodosFavs) window.atualizarTodosFavs();
}

function fazerCadastro() {
    const nome = document.getElementById("regNome").value.trim();
    const user = document.getElementById("regUser").value.trim().toLowerCase();
    const err  = document.getElementById("registerError");
    const us   = getUsuarios();
    if (!nome) { err.textContent = "Digite seu nome."; return; }
    if (!user) { err.textContent = "Escolha um usuário."; return; }
    if (us[user]) { err.textContent = "Usuário já existe."; return; }
    us[user] = { nome, user };
    salvarUsuarios(us);
    setLogado(user);
    atualizarHeader();
    fecharRegister();
}

document.getElementById("navLoginBtn").addEventListener("click", function () {
    if (getLogado()) {
        if (confirm("Sair da conta?")) { setLogado(null); atualizarHeader(); if (window.atualizarTodosFavs) window.atualizarTodosFavs(); }
    } else {
        abrirLogin();
    }
});

document.getElementById("overlayLogin").addEventListener("click",
    e => { if (e.target === document.getElementById("overlayLogin")) fecharLogin(); });

document.getElementById("overlayRegister").addEventListener("click",
    e => { if (e.target === document.getElementById("overlayRegister")) fecharRegister(); });

document.addEventListener("keydown", e => {
    if (e.key !== "Escape") return;
    if (document.getElementById("overlayLogin").classList.contains("active"))    fecharLogin();
    if (document.getElementById("overlayRegister").classList.contains("active")) fecharRegister();
});

document.getElementById("inputUser").addEventListener("keydown",
    e => { if (e.key === "Enter") fazerLogin(); });

atualizarHeader();

const _favBtn = document.getElementById("navFavBtn");
if (_favBtn) {
    _favBtn.addEventListener("click", function() {
        if (getLogado()) {
            window.location.href = "favoritos.html";
        } else {
            abrirLogin();
        }
    });
}

window.fecharLogin    = fecharLogin;
window.fecharRegister = fecharRegister;
window.abrirRegister  = abrirRegister;
window.abrirLogin     = abrirLogin;
window.fazerLogin     = fazerLogin;
window.fazerCadastro  = fazerCadastro;
