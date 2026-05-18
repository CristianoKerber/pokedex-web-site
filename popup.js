const STAT_CONFIG = {
    "hp":              { label: "HP",             classe: "bar-hp"              },
    "attack":          { label: "ATTACK",         classe: "bar-attack"          },
    "defense":         { label: "DEFENSE",        classe: "bar-defense"         },
    "special-attack":  { label: "SPECIAL-ATTACK", classe: "bar-special-attack"  },
    "special-defense": { label: "SPECIAL-DEFENSE",classe: "bar-special-defense" },
    "speed":           { label: "SPEED",          classe: "bar-speed"           },
};

const TIPO_CLASSE_POPUP = {
    grass:    "grama",    poison:   "veneno",
    fire:     "fogo",     flying:   "voador",
    water:    "agua",     bug:      "inseto",
    normal:   "normal",   electric: "eletrico",
    ground:   "terra",    fairy:    "fada",
    fighting: "lutador",  psychic:  "psiquico",
    rock:     "pedra",    ghost:    "fantasma",
    ice:      "gelo",     dragon:   "dragao",
    dark:     "sombrio",  steel:    "aco",
};

const GRADIENTE_POR_CLASSE = {
    
    "normal":   "radial-gradient(circle at top, white, gray)",
    "fogo":     "radial-gradient(circle at top, khaki, orangered)",
    "agua":     "radial-gradient(circle at top, rgb(122,176,228), rgb(5,91,172))",
    "grama":    "radial-gradient(circle at top, limegreen, seagreen)",
    "eletrico": "radial-gradient(circle at top, khaki, orange)",
    "gelo":     "radial-gradient(circle at top, aliceblue, lightskyblue)",
    "lutador":  "radial-gradient(circle at top, tomato, darkred)",
    "veneno":   "radial-gradient(circle at top, plum, purple)",
    "terra":    "radial-gradient(circle at top, chocolate, sienna)",
    "voador":   "radial-gradient(circle at top, paleturquoise, steelblue)",
    "psiquico": "radial-gradient(circle at top, lightsalmon, palevioletred)",
    "inseto":   "radial-gradient(circle at top, lawngreen, olivedrab)",
    "pedra":    "radial-gradient(circle at top, lemonchiffon, brown)",
    "fada":     "radial-gradient(circle at top, lightpink, fuchsia)",
    "fantasma": "radial-gradient(circle at top, orchid, indigo)",
    "dragao":   "radial-gradient(circle at top, royalblue, darkblue)",
    "sombrio":  "radial-gradient(circle at top, slategray, #1a1a2e)",
    "aco":      "radial-gradient(circle at top, lightsteelblue, steelblue)",
    
    "grama-veneno":   "linear-gradient(to right, limegreen, purple)",
    "fogo-voador":    "linear-gradient(to right, orangered, paleturquoise)",
    "inseto-voador":  "linear-gradient(to right, olivedrab, paleturquoise)",
    "inseto-veneno":  "linear-gradient(to right, olivedrab, purple)",
    "normal-voador":  "linear-gradient(to right, gray, paleturquoise)",
    "veneno-terra":   "linear-gradient(to right, purple, chocolate)",
    "fada-normal":    "linear-gradient(to right, gray, lightpink)",
    "veneno-voador":  "linear-gradient(to right, purple, paleturquoise)",
    "inseto-grama":   "linear-gradient(to right, olivedrab, limegreen)",
    
    "normal-fada":    "linear-gradient(to right, gray, lightpink)",
    "voador-fogo":    "linear-gradient(to right, paleturquoise, orangered)",
    "voador-inseto":  "linear-gradient(to right, paleturquoise, olivedrab)",
    "veneno-inseto":  "linear-gradient(to right, purple, olivedrab)",
    "voador-normal":  "linear-gradient(to right, paleturquoise, gray)",
    "terra-veneno":   "linear-gradient(to right, chocolate, purple)",
    "voador-veneno":  "linear-gradient(to right, paleturquoise, purple)",
    "grama-inseto":   "linear-gradient(to right, limegreen, olivedrab)",
    "pedra-terra":    "linear-gradient(to right, brown, chocolate)",
    "agua-gelo":      "linear-gradient(to right, rgb(5,91,172), lightskyblue)",
    "pedra-agua":     "linear-gradient(to right, brown, rgb(5,91,172))",
    "lutador-psiquico":"linear-gradient(to right, darkred, palevioletred)",
    "grama-psiquico": "linear-gradient(to right, seagreen, palevioletred)",
    "agua-psiquico":  "linear-gradient(to right, rgb(5,91,172), palevioletred)",
    "fogo-pedra":     "linear-gradient(to right, orangered, brown)",
    "fantasma-veneno":"linear-gradient(to right, indigo, purple)",
    "psiquico-voador":"linear-gradient(to right, palevioletred, steelblue)",
    "gelo-psiquico":  "linear-gradient(to right, lightskyblue, palevioletred)",
    "dragao-voador":  "linear-gradient(to right, darkblue, steelblue)",
    "agua-voador":    "linear-gradient(to right, rgb(5,91,172), paleturquoise)",
    "eletrico-aco":   "linear-gradient(to right, orange, lightsteelblue)",
    "terra-pedra":    "linear-gradient(to right, chocolate, brown)",
};

const STAT_MAX = 255;

const overlay    = document.getElementById("popupOverlay");
const popupCard  = document.getElementById("popupCard");
const popupClose = document.getElementById("popupClose");
const popupImg   = document.getElementById("popupImg");
const popupStats = document.getElementById("popupStats");

let pokemonAtual = null;

function classeDosTipos(tipos) {
    return tipos.map(t => TIPO_CLASSE_POPUP[t] || t).join("-");
}

function aplicarGradiente(tipos) {
    const classe   = classeDosTipos(tipos);
    const gradiente = GRADIENTE_POR_CLASSE[classe]
                   || GRADIENTE_POR_CLASSE[TIPO_CLASSE_POPUP[tipos[0]]]
                   || "radial-gradient(circle at top, #555, #222)";
    popupCard.style.background = gradiente;
}

function estaFavoritado(pokemonId) {
    const logado   = localStorage.getItem("missingmon_logado");
    const usuarios = JSON.parse(localStorage.getItem("missingmon_usuarios") || "{}");
    const salvos   = logado && usuarios[logado] ? (usuarios[logado].salvos || []) : [];
    return salvos.includes(pokemonId);
}

function atualizarPopupFav(pokemonId) {
    const btn = document.getElementById("popupFav");
    const img = document.getElementById("popupFavImg");
    if (!btn || !img) return;
    const salvo = estaFavoritado(pokemonId);
    btn.classList.toggle("favoritado", salvo);
    img.style.opacity = salvo ? "1" : "0.85";
}

function toggleFavPopup() {
    if (!pokemonAtual) return;
    const logado = localStorage.getItem("missingmon_logado");
    if (!logado) { window.abrirLogin(); return; }
    const usuarios = JSON.parse(localStorage.getItem("missingmon_usuarios") || "{}");
    if (!usuarios[logado]) return;
    const salvos = usuarios[logado].salvos || [];
    const idx    = salvos.indexOf(pokemonAtual.id);
    if (idx === -1) salvos.push(pokemonAtual.id);
    else            salvos.splice(idx, 1);
    usuarios[logado].salvos = salvos;
    localStorage.setItem("missingmon_usuarios", JSON.stringify(usuarios));
    atualizarPopupFav(pokemonAtual.id);
    if (window.atualizarTodosFavs) window.atualizarTodosFavs();
}

function abrirPopup(pokemon) {
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
    pokemonAtual = pokemon;
    renderizarPopup(pokemon);
    atualizarPopupFav(pokemon.id);
}

function fecharPopup() {
    overlay.classList.remove("active");
    document.body.style.overflow = "";

    setTimeout(() => {
        popupImg.src               = "";
        popupStats.innerHTML       = "";
        popupCard.style.background = "";
        pokemonAtual               = null;
    }, 280);
}

function mostrarSkeleton() {
    popupImg.src         = "";
    popupCard.style.background = "radial-gradient(circle at top, #444, #222)";
    popupStats.innerHTML = `
        <div class="popup-loading">
            ${Array(6).fill('<div class="skeleton-bar"></div>').join("")}
        </div>`;
}

function renderizarPopup(pokemon) {
    const tipos = pokemon.types.map(t => t.type.name);

    
    aplicarGradiente(tipos);

    
    trocarImagem("pixel");

    
    renderizarStats(pokemon.stats);
}

function trocarImagem(modo) {
    if (!pokemonAtual) return;

    const pixel   = pokemonAtual.sprites.front_default;
    const oficial = pokemonAtual.sprites.other["official-artwork"].front_default
                 || pixel;

    
    popupImg.style.opacity = "0";
    setTimeout(() => {
        popupImg.src = modo === "pixel" ? pixel : oficial;
        popupImg.alt = pokemonAtual.name;
        
        popupImg.classList.toggle("modo-art", modo === "oficial");
        popupImg.style.opacity = "1";
    }, 180);
}

function renderizarStats(stats) {
    popupStats.innerHTML = "";

    
    const fills = [];

    stats.forEach((statObj, index) => {
        const config = STAT_CONFIG[statObj.stat.name];
        if (!config) return;

        const valor       = statObj.base_stat;
        const porcentagem = Math.min((valor / STAT_MAX) * 100, 100);

        const row = document.createElement("div");
        row.classList.add("stat-row");
        row.innerHTML = `
            <span class="stat-label">${config.label}</span>
            <div class="stat-bar-track">
                <div class="stat-bar-fill ${config.classe}" style="width:0%"></div>
            </div>
            <span class="stat-value">${valor}</span>
        `;
        popupStats.appendChild(row);
        fills.push({ el: row.querySelector(".stat-bar-fill"), pct: porcentagem });
    });

    
    popupStats.getBoundingClientRect();

    
    fills.forEach(({ el, pct }, index) => {
        setTimeout(() => {
            el.style.width = pct + "%";
        }, 80 + index * 80);
    });
}

function mostrarArteOficial() {
    trocarImagem("oficial");
    popupStats.innerHTML = `
        <p class="msg-3d">
            Arte oficial do pokémon.<br>
            <small>Clique em BASE para voltar às stats.</small>
        </p>`;
}

document.getElementById("popupFav").addEventListener("click", toggleFavPopup);

overlay.addEventListener("click", (e) => { if (e.target === overlay) fecharPopup(); });
popupClose.addEventListener("click", fecharPopup);
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("active")) fecharPopup();
});

window.abrirPopup = abrirPopup;
